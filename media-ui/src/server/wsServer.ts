import express, { RequestHandler } from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { createClient } from "@connectrpc/connect";
import { SpeechInsightOrchestrator } from "@/grpc/generated/InsightInfer_connect";
import {
  StreamingSpeechInferRequest,
  StreamingSpeechInferResponse,
} from "@/grpc/generated/InsightInfer_pb";
import { PartialMessage } from "@bufbuild/protobuf";

import {
  decodeBase64ToUint8Array,
  safeLogRequest,
  safeLogResponse,
} from "./utils";
import { PushableStream } from "./PushableStream";
import {
  mapRole,
  mapRequestType,
  mapEventType,
  mapInputAudioEncoding,
  mapOutputAudioEncoding,
} from "./enumMapper";

import { Logger } from "./logger";

/** ===============================================================================
 *  Deep-scrub helper – collapses every audio payload or bearer token
 *  so logs stay readable and safe.
 *
 *  @param obj – The object to scrub in-place.
 *  @returns A JSON string of the scrubbed clone.
 *  ===============================================================================*/
function safeLogWs(obj: any): string {
  const clone: any = JSON.parse(JSON.stringify(obj));
  if (clone?.metadata?.token) {
    clone.metadata.token = `<redacted:${clone.metadata.token.length}chars>`;
  }
  const scrub = (o: any) => {
    if (!o || typeof o !== "object") return;
    if (o.audioContent) {
      const bytes =
        typeof o.audioContent === "string"
          ? Buffer.from(o.audioContent, "base64").length
          : o.audioContent instanceof Uint8Array
          ? o.audioContent.length
          : 0;
      o.audioContent = `{length:${bytes}}`;
    }
    if (o.streamSpeechRequest?.case === "audioContent") {
      const v = o.streamSpeechRequest.value;
      const bytes =
        typeof v === "string"
          ? Buffer.from(v, "base64").length
          : v instanceof Uint8Array
          ? v.length
          : 0;
      o.streamSpeechRequest.value = `{length:${bytes}}`;
    }
    Object.values(o).forEach(scrub);
  };
  scrub(clone);
  return JSON.stringify(clone, null, 2);
}

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ noServer: true });

/** ================================================================================
 *  WebSocket Connection Handler
 *
 *  Sets up per-client state, initializes gRPC on first message, and
 *  bridges between WebSocket frames and gRPC StreamingSpeechInfer calls.
 *  ===============================================================================*/
wss.on("connection", (ws: WebSocket) => {
  const log = new Logger();
  log.info("WS client connected");

  let token    = "";
  let host     = "";

  let transport: ReturnType<typeof createGrpcTransport> | null = null;
  let client:
    | ReturnType<typeof createClient<typeof SpeechInsightOrchestrator>>
    | null = null;
  let requestStream:
    | PushableStream<PartialMessage<StreamingSpeechInferRequest>>
    | null = null;
  let duplex:
    | {
        send(req: StreamingSpeechInferRequest): Promise<void>;
        close(): void;
        [Symbol.asyncIterator](): AsyncIterator<StreamingSpeechInferResponse>;
      }
    | null = null;
  let closed = false;

  /** ===============================================================================
   *  Lazily initializes the gRPC transport, client, and PushableStream
   *  once the first WS message arrives with token/host metadata.
   *  Begins an async loop forwarding gRPC responses back over WS.
   *  ===============================================================================*/
  function initGrpc() {
    let audioChunkCount = 0;

    const shouldLogRequest = (req: StreamingSpeechInferRequest) => {
      const j = req.toJson() as any;
      const isAudio =
        j?.streamSpeechRequest && j.streamSpeechRequest.case === "audioContent";
      return !isAudio || audioChunkCount++ === 0;
    };

    transport = createGrpcTransport({
      httpVersion: "2",
      pingIntervalMs: 0,
      pingIdleConnection: true,
      pingTimeoutMs: 5000,
      idleConnectionTimeoutMs: 0,
      baseUrl:
        host ||
        "https://ferrari-intg-insight-orchestrator.intg-us1.rtmslab.net",
      interceptors: [
        (next) => async (req) => {
          const hdrs = [...req.header.entries()].filter(
            ([k]) => k.toLowerCase() !== "authorization"
          );
          log.info("gRPC headers →", [...req.header.entries()]);
          req.header.set("Authorization", `Bearer ${token}`);
          return next(req);
        },
      ],
    });

    client = createClient(SpeechInsightOrchestrator, transport);
    requestStream = new PushableStream();
    const responseStream = client.inferStreamingSpeechInsights(
      requestStream
    );

    duplex = {
      async send(req: StreamingSpeechInferRequest) {
        // if (shouldLogRequest(req)) {
        //   console.log(
        //     `[${new Date().toISOString()}] Server ⇒ gRPC request`,
        //     safeLogRequest(req)
        //   );
        // }
        requestStream!.push(req);
      },
      close() {
        log.info("closing gRPC request stream");
        requestStream!.close();
      },
      [Symbol.asyncIterator]() {
        return responseStream[Symbol.asyncIterator]();
      },
    };

    ;(async () => {
      try {
        for await (const rsp of duplex!) {
          log.info("⇐ gRPC response", safeLogResponse(rsp));
          const prompts =
            rsp.inferInsightResponse?.virtualAgentResult?.prompts || [];
          prompts.forEach((p, i) => {
           log.info(`Prompt ${i}, text: ${p.text || "<empty>"}, audioContent size: ${p.audioContent ? p.audioContent.length : 0} bytes`)
          });
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(rsp.toJson()));
          } else {
            log.warn("WS closed – stop gRPC loop");
            break;
          }
        }
        log.info("gRPC stream ended – WS remains open");
      } catch (err: any) {
        const grpcMsg  = err.rawMessage ?? err.message ?? String(err);
        const grpcCode = err.code ?? "n/a";
        log.error(`gRPC stream error → (${grpcCode}) ${err.message}`);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ error: `gRPC ${grpcCode}: ${grpcMsg}` })
          );
          ws.close(1011, "gRPC error");
        }
      }
    })();
  }

  /** ================================================================================
   *  Handles incoming WS frames:
   *   • Parses JSON, initializes gRPC if needed
   *   • Applies enum mappings to config fields
   *   • Decodes Base64 audio into Uint8Array
   *   • Builds a PartialMessage and forwards via duplex.send()
   *   • Closes streams on CALL_END
   *  ================================================================================*/
  ws.on("message", (rawData) => {
    if (closed) return;
    let data: any;

    try {
      data = JSON.parse(rawData.toString());
      // console.log(`[... ] Server ⇐ WS message`, safeLogWs(data));
    } catch {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
      ws.close(1008, "Bad JSON");
      return;
    }

    if (data.streamingInsightConfig) {
      log.setIds(data.streamingInsightConfig.orgId, data.streamingInsightConfig.conversationId);
    }
    const metadata = data.metadata;
    const rest     = { ...data };
    delete (rest as any).metadata;

    if (!duplex) {
      if (!metadata?.token) {
        ws.send(JSON.stringify({ error: "No token provided" }));
        ws.close(1008, "No token");
        return;
      }
      token = metadata.token;
      host  = metadata.host || "";
      log.info(`init gRPC (host=${host})`);
      initGrpc();
    }

    // enum mappings
    if (rest.streamingConfig?.config?.encoding) {
      rest.streamingConfig.config.encoding = mapInputAudioEncoding(
        rest.streamingConfig.config.encoding
      );
    }
    if (rest.outputAudioConfig) {
      rest.outputAudioConfig = {
        audioEncoding: mapOutputAudioEncoding(
          rest.outputAudioConfig.audioEncoding || "MULAW"
        ),
        sampleRateHertz: 8000,
        voice: {
          languageCode:
            rest.outputAudioConfig.voice?.languageCode || "en-US",
        },
      };
    }
    if (rest.streamingInsightConfig?.role) {
      rest.streamingInsightConfig.role = mapRole(
        rest.streamingInsightConfig.role
      );
    }
    if (rest.streamingInsightConfig?.requestType) {
      rest.streamingInsightConfig.requestType = mapRequestType(
        rest.streamingInsightConfig.requestType
      );
    }
    if (rest.inputEvent?.eventType) {
      rest.inputEvent.eventType = mapEventType(
        rest.inputEvent.eventType
      );
    }
    if (data.ping) return;

    // build request
    const reqObj: PartialMessage<StreamingSpeechInferRequest> = {
      messageId: rest.messageId || `msg-${Date.now()}`,
      inputEvent: rest.inputEvent,
      outputAudioConfig: rest.outputAudioConfig,
      dtmfEvent: rest.dtmfEvent,
    };

    // handle audioContent base64→Uint8Array
    if (
      rest.streamSpeechRequest?.case === "audioContent" &&
      rest.streamSpeechRequest.value
    ) {
      try {
        const audioContent = decodeBase64ToUint8Array(
          rest.streamSpeechRequest.value
        );
        reqObj.streamSpeechRequest = {
          case: "audioContent",
          value: audioContent,
        };
      } catch (e) {
        ws.send(
          JSON.stringify({
            error: "Invalid audioContent",
            details: String(e),
          })
        );
        return;
      }
    } else if (rest.streamingConfig) {
      reqObj.streamSpeechRequest = {
        case: "streamingConfig",
        value: rest.streamingConfig,
      };
    } else if (rest.streamingInsightConfig) {
      reqObj.streamSpeechRequest = {
        case: "streamingInsightConfig",
        value: rest.streamingInsightConfig,
      };
    } else if (rest.closeStream) {
      reqObj.streamSpeechRequest = {
        case: "closeStream",
        value: rest.closeStream,
      };
    } else if (rest.text) {
      reqObj.streamSpeechRequest = { case: "text", value: rest.text };
    } else if (rest.audioContent) {
      try {
        const audioContent = decodeBase64ToUint8Array(rest.audioContent);
        reqObj.streamSpeechRequest = {
          case: "audioContent",
          value: audioContent,
        };
      } catch (e) {
        ws.send(
          JSON.stringify({
            error: "Invalid audioContent",
            details: String(e),
          })
        );
        return;
      }
    }

    // send upstream
    if (!duplex) return;
    duplex
      .send(new StreamingSpeechInferRequest(reqObj))
      .catch((err) => {
        const msg = String(err);
        if (msg.includes("Stream is closed")) {
          log.info(`late frame ignored - ${msg})`);
          return;
        }
        ws.send(
          JSON.stringify({ error: "Failed to send request", details: msg })
        );
      });

    // graceful shutdown on CALL_END
    if (rest.inputEvent?.eventType === 2) {
      log.info("CALL_END – closing streams");
      duplex.close();
      ws.close(1000, "CALL_END");
      closed = true;
    }
  });

  /** ===============================================================================
   *  WebSocket Close Handler
   *
   *  Cleans up the duplex stream when the WS connection closes.
   *  ===============================================================================*/
  ws.on("close", (code, reason) => {
    log.info(`WS closed (${code}) ${reason.toString()}`);
    closed = true;
    duplex?.close();
  });
});

/** ================================================================================
 *  Health-check endpoint
 *
 *  Responds to GET "/" with a simple status message.
 *  ===============================================================================*/
const health: RequestHandler = (_req, res) => {
  res.send("Audio bridging server is running.");
};
app.get("/", health);

/** ================================================================================
 *  Upgrades incoming HTTP requests on "/ws" to WebSocket connections.
 *  ===============================================================================*/
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (sock) => {
      wss.emit("connection", sock, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(3001, () =>
  console.log(`[${new Date().toISOString()}] Server listening on 3001`)
);

/** ===============================================================================
 *  Pauses execution for the specified number of milliseconds.
 *
 *  @param ms – Time to wait in milliseconds.
 *  @returns A Promise that resolves after the delay.
 *  =============================================================================== */
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** ===============================================================================
 *  Returns the current timestamp in ISO-8601 format.
 *
 *  @returns A string representing the current time.
 *  =============================================================================== */
function ts(): string {
  return new Date().toISOString();
}
