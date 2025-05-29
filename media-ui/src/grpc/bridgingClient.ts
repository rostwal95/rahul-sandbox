/* ==================================================================================
 * Lightweight wrapper for gRPC-over-WebSocket communication. Provides:
 *  • startCall(): opens a WebSocket, handles protobuf ↔ JSON conversion,
 *    heartbeat, token metadata, and close control modes.
 *  • StreamingCall interface: send(), closeStream(), close(), and async iterator.
 *
 * Internally, uses:
 *  - StreamingSpeechInferRequest / Response from InsightInfer protobuf
 *  - wsOpen(): await WebSocket open with timeout
 *  - buildWrapper(): inject auth metadata into outgoing frames
 * ==================================================================================*/

/* eslint-disable no-console */
import {
  StreamingSpeechInferRequest,
  StreamingSpeechInferResponse,
} from "@/grpc/generated/InsightInfer_pb";
import { Config } from "@/components/ConfigScreen";
import { JsonValue } from "@bufbuild/protobuf";

/** ====================================================================
 * Union type representing messages from the WebSocket:
 *  • StreamingSpeechInferResponse
 *  • error object with message and optional details
 * ==================================================================== */
export type ServerMessage =
  | StreamingSpeechInferResponse
  | { error: string; details?: string };

/** ====================================================================
 * Represents an active call-stream over WebSocket.
 * Provides:
 *  • send(): send a request frame (with or without metadata)
 *  • closeStream(): send closeStream or callEnd event
 *  • close(): immediately close underlying socket
 *  • Symbol.asyncIterator: no-op iterator for compatibility
 * ==================================================================== */
export interface StreamingCall {
  send(
    msg: StreamingSpeechInferRequest | Record<string, unknown>,
    includeMeta?: boolean
  ): Promise<void>;
  closeStream(): Promise<void>;
  close(): void;
  [Symbol.asyncIterator](): AsyncIterator<StreamingSpeechInferResponse>;
}

/** ====================================================================
 * Options for startCall():
 *  • closeMode: "complete" | "callEnd"
 * ==================================================================== */
export interface StartCallOptions {
  closeMode?: "complete" | "callEnd";
}

/* ======================================================================
 *     Used when Config.host is empty.
 * =====================================================================*/
const FALLBACK_HOST =
  "https://ferrari-intg-insight-orchestrator.intg-us1.rtmslab.net";

/** =====================================================================
 * Injects metadata (host, token) into outgoing payloads.
 * @param cfg - user-supplied Config object
 * @param body - the JSON payload to wrap
 * @returns merged object with metadata field
 *  ====================================================================*/

const buildWrapper = (cfg: Config, body: Record<string, unknown>) => ({
  ...body,
  metadata: { host: cfg.host || FALLBACK_HOST, token: cfg.token },
});

/** ====================================================================
 * Returns a promise that resolves when the WebSocket is open,
 * or rejects after 10 seconds.
 * @param ws - the WebSocket instance
 * ==================================================================== */

const wsOpen = (ws: WebSocket) =>
  new Promise<void>((res, rej) => {
    if (ws.readyState === WebSocket.OPEN) return res();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        clearInterval(iv);
        res();
      } else if (Date.now() - t0 > 10_000) {
        clearInterval(iv);
        rej(new Error("WS open timeout"));
      }
    }, 40);
  });

/** ====================================================================
 * Opens a WebSocket to the local server ("ws://localhost:3001/ws").
 * Manages:
 *  • authentication metadata injection
 *  • lazy connect on first send()
 *  • heartbeat ping every 30 seconds
 *  • JSON parsing and error handling
 *  • close modes: complete vs. callEnd
 *
 * @param onMsg   - callback for each incoming ServerMessage
 * @param cfg     - user-provided Config
 * @param opts    - StartCallOptions
 * @returns       - StreamingCall instance
 ==================================================================== */
export const bridgingClient = {
  startCall(
    onMsg: (m: ServerMessage) => void,
    cfg: Config,
    opts: StartCallOptions = { closeMode: "complete" }
  ): StreamingCall {
    // Ensure a non-empty trimmed token
    const token = cfg.token?.trim();
    if (!token) {
      onMsg({ error: "No token provided" });
      return stubCall();
    }
    cfg.token = token;

    let ws: WebSocket | null = null;
    let sentFirst = false;
    let closed = false;

    /**  ====================================================================
     * Establishes the WebSocket and sets up event handlers:
     *  - onopen: heartbeat ping
     *  - onmessage: JSON → protobuf deserialization
     *  - onerror / onclose: error forwarding
     *  ==================================================================== */
    const connect = () => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? (location.hostname === "localhost" && location.port === "3000"
     ? "ws://localhost:3001/ws"
     : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
    
     console.log(`[WebSocket] Connecting to: ${WS_URL}`);
    
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        const ping = setInterval(() => {
          if (ws!.readyState === WebSocket.OPEN) ws!.send('{"ping":1}');
          else clearInterval(ping);
        }, 30_000);
      };

      ws.onmessage = (ev) => {
        try {
          const obj = JSON.parse(ev.data as string);
          if ("error" in obj)
            onMsg({ error: obj.error, details: obj.details });
          else
            onMsg(StreamingSpeechInferResponse.fromJson(obj));
        } catch (e) {
          onMsg({ error: "Bad server JSON", details: String(e) });
        }
      };

      ws.onerror = (e) =>
        onMsg({ error: "WebSocket error", details: String(e) });

      ws.onclose = (ev) => {
        if (closed) return;
        onMsg({
          error: "WebSocket closed",
          details: ev.reason || `code ${ev.code}`,
        });
        closed = true;
      };
    };

    return {
      /** ========================================================================
       * Sends a message frame. Performs lazy connect on first call.
       * Optionally includes metadata on the first frame or when includeMeta=true.
       * =========================================================================*/ 

      async send(msg, includeMeta = false) {
        if (!ws) connect();
        await wsOpen(ws!);

        const json =
          msg instanceof StreamingSpeechInferRequest
            ? (msg.toJson({ emitDefaultValues: true }) as JsonValue)
            : msg;

        const payload =
          includeMeta || !sentFirst
            ? buildWrapper(cfg, json as any)
            : json;

        sentFirst ||= includeMeta;
        ws!.send(JSON.stringify(payload));
      },

      /** ======================================================================
       * Sends the appropriate end-of-stream command.
       * ====================================================================== */
      async closeStream() {
        if (!ws || closed) return;
        await wsOpen(ws);
        const cmd =
          opts.closeMode === "callEnd"
            ? { inputEvent: { eventType: 2 } }
            : { closeStream: true };
        ws.send(JSON.stringify(buildWrapper(cfg, cmd)));
      },

      /** ======================================================================
       *          Immediately closes the WebSocket.
       *  =====================================================================*/
      close() {
        if (ws && !closed) {
          closed = true;
          try {
            ws.close(1000, "Manual close");
          } catch {}
        }
      },

      /** =======================================================================
       *                        async iterator stub
       * =======================================================================*/
      async *[Symbol.asyncIterator]() {
        while (!closed) await new Promise((r) => setTimeout(r, 500));
      },
    };
  },
};

/** ==============================================================================
 *     Returns a no-op StreamingCall for error cases ( like missing token).
 * ==============================================================================*/
function stubCall(): StreamingCall {
  return {
    async send() {
      throw new Error("No-token stub");
    },
    async closeStream() {},
    close() {},
    async *[Symbol.asyncIterator]() {},
  };
}
