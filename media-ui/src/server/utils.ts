import { Buffer } from "buffer";
import {
  StreamingSpeechInferRequest,
  StreamingSpeechInferResponse,
} from "@/grpc/generated/InsightInfer_pb";

/** ================================================================================
 *  Deep-scrub helper – collapses every audio payload or bearer token
 *  so logs stay readable and safe.
 *  ===============================================================================*/

function scrub(o: any): void {
  if (!o || typeof o !== "object") return;

  if (o.audioContent) {
    const bytes =
      typeof o.audioContent === "string"
        ? Buffer.from(o.audioContent, "base64").length
        : o.audioContent.length;
    o.audioContent = `[bytes=${bytes}]`;
  }

  if (o.streamSpeechRequest?.case === "audioContent") {
    const v = o.streamSpeechRequest.value;
    const bytes =
      typeof v === "string" ? Buffer.from(v, "base64").length : v.length;
    o.streamSpeechRequest.value = `[bytes=${bytes}]`;
  }

  if (o.metadata?.token)         o.metadata.token = `<redacted>`;
  if (o.metadata?.authorization) o.metadata.authorization = `<redacted>`;

  Object.values(o).forEach(scrub);
}

/**=================================================================================
 * Converts a Base64-encoded string into a Uint8Array of raw bytes.
 *
 * @param b64 – Base64-encoded audio payload
 * @returns Uint8Array containing the decoded bytes
 *  ===============================================================================*/

export const decodeBase64ToUint8Array = (b64: string): Uint8Array =>
  new Uint8Array(Buffer.from(b64, "base64"));

/** ================================================================================
 * Serializes a StreamingSpeechInferRequest to JSON, scrubs out
 * any audio or token data, and pretty-prints for safe logging.
 *
 * @param req – The gRPC request message
 * @returns A JSON string with sensitive fields redacted
 *  ===============================================================================*/

export function safeLogRequest(req: StreamingSpeechInferRequest): string {
  const j = req.toJson({ emitDefaultValues: true }) as any;
  scrub(j);
  return JSON.stringify(j, null, 2);
}

/**  ===============================================================================
 * Serializes a StreamingSpeechInferResponse to JSON, scrubs out
 * any audio or token data, and pretty-prints for safe logging.
 *
 * @param rsp – The gRPC response message
 * @returns A JSON string with sensitive fields redacted
 *  ===============================================================================*/
export function safeLogResponse(
  rsp: StreamingSpeechInferResponse
): string {
  const j = rsp.toJson({ emitDefaultValues: true }) as any;
  scrub(j);
  return JSON.stringify(j, null, 2);
}
