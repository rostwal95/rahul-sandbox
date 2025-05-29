import { RecognitionConfig_AudioEncoding } from "@/grpc/generated/InsightInfer_pb";

/** ===========================================================================
 * Maps a role identifier (string or number) to its numeric enum value.
 *
 * @param role – One of:
 *   • numeric enum value  
 *   • "IVR"  
 *   • "CALLER"  
 *   • "AGENT"  
 * @returns Numeric code:
 *   0 = IVR, 1 = CALLER, 2 = AGENT (defaults to 0 on unknown)
 * =========================================================================== */

export function mapRole(role: string | number): number {
  if (typeof role === "number") return role;
  switch (role.toUpperCase()) {
    case "IVR":
      return 0;
    case "CALLER":
      return 1;
    case "AGENT":
      return 2;
    default:
      console.warn(`Unknown role: ${role}, defaulting to 0`);
      return 0;
  }
}

/** ===============================================================================
 * Maps a request-type identifier (string or number) to its numeric enum value.
 *
 * @param requestType – One of:
 *   • numeric enum value  
 *   • "DEFAULT_UNSPECIFIED"  
 *   • "VIRTUAL_AGENT"  
 *   • "AGENT_ASSIST"  
 * @returns Numeric code:
 *   0 = DEFAULT_UNSPECIFIED, 1 = VIRTUAL_AGENT, 2 = AGENT_ASSIST (defaults to 0)
 * ================================================================================*/

export function mapRequestType(requestType: string | number): number {
  if (typeof requestType === "number") return requestType;
  switch (requestType.toUpperCase()) {
    case "DEFAULT_UNSPECIFIED":
      return 0;
    case "VIRTUAL_AGENT":
      return 1;
    case "AGENT_ASSIST":
      return 2;
    default:
      console.warn(`Unknown requestType: ${requestType}, defaulting to 0`);
      return 0;
  }
}

/** ===========================================================================
 * Maps an event-type identifier (string or number) to its numeric enum value.
 *
 * @param eventType – One of:
 *   • numeric enum value  
 *   • "UNSPECIFIED"  
 *   • "CALL_START"  
 *   • "CALL_END"  
 *   • "CUSTOM"  
 *   • "NO_INPUT"  
 *   • "START_OF_DTMF"  
 *   • "STOP_STREAMING_RESPONSE"  
 * @returns Numeric code 0–6 (defaults to 0)
 * =========================================================================== */ 

export function mapEventType(eventType: string | number): number {
  if (typeof eventType === "number") return eventType;
  switch (eventType.toUpperCase()) {
    case "UNSPECIFIED":
      return 0;
    case "CALL_START":
      return 1;
    case "CALL_END":
      return 2;
    case "CUSTOM":
      return 3;
    case "NO_INPUT":
      return 4;
    case "START_OF_DTMF":
      return 5;
    case "STOP_STREAMING_RESPONSE":
      return 6;
    default:
      console.warn(`Unknown eventType: ${eventType}, defaulting to 0`);
      return 0;
  }
}

/** ===========================================================================
 * Maps an input-audio-encoding identifier (string or number) into
 * the generated RecognitionConfig_AudioEncoding enum.
 *
 * @param encoding – One of:
 *   • numeric enum value  
 *   • "LINEAR16"  
 *   • "MULAW"  
 * @returns RecognitionConfig_AudioEncoding.LINEAR16 or .MULAW
 * =========================================================================== */

export function mapInputAudioEncoding(
  encoding: string | number
): RecognitionConfig_AudioEncoding {
  if (typeof encoding === "number") {
    return encoding as RecognitionConfig_AudioEncoding;
  }
  switch (encoding.toUpperCase()) {
    case "LINEAR16":
      return RecognitionConfig_AudioEncoding.LINEAR16;
    case "MULAW":
      return RecognitionConfig_AudioEncoding.MULAW;
    default:
      console.warn(`Unknown input encoding: ${encoding}, defaulting to LINEAR16`);
      return RecognitionConfig_AudioEncoding.LINEAR16;
  }
}

/** ===========================================================================
 * Maps an output-audio-encoding identifier (string or number) to its
 * numeric enum value as expected by the TTS service.
 *
 * @param audioEncoding – One of:
 *   • numeric enum value  
 *   • "OUTPUT_LINEAR16", "LINEAR16"  
 *   • "OUTPUT_MULAW",    "MULAW"  
 *   • "OUTPUT_ALAW"  
 *   • "OUTPUT_MP3"  
 *   • "OGG_OPUS"  
 * @returns Numeric code (1–5; defaults to 2 = OUTPUT_MULAW)
 * ============================================================================*/

export function mapOutputAudioEncoding(
  audioEncoding: string | number
): number {
  if (typeof audioEncoding === "number") {
    if (audioEncoding >= 0 && audioEncoding <= 5) {
      return audioEncoding;
    } else if (audioEncoding === 6) {
      console.warn(
        `Received numeric output audioEncoding ${audioEncoding} (MULAW expected), mapping it to 2`
      );
      return 2;
    } else {
      console.warn(
        `Unknown numeric output audioEncoding: ${audioEncoding}, defaulting to MULAW (2)`
      );
      return 2;
    }
  }

  switch (String(audioEncoding).toUpperCase()) {
    case "OUTPUT_LINEAR16":
    case "LINEAR16":
      return 1;
    case "OUTPUT_MULAW":
    case "MULAW":
      return 2;
    case "OUTPUT_ALAW":
      return 3;
    case "OUTPUT_MP3":
      return 4;
    case "OGG_OPUS":
      return 5;
    default:
      console.warn(
        `Unknown output audioEncoding: ${audioEncoding}, defaulting to MULAW (2)`
      );
      return 2;
  }
}
