/* =============================================================================
   types.ts – Call state and server message definitions
   ============================================================================*/

   import { StreamingSpeechInferResponse } from "@/grpc/generated/InsightInfer_pb";

   /** =========================================================================
    * CallState
    *
    * Enumerates the various states in the call lifecycle:
    *  • IDLE            – before a call is started
    *  • CALL_START      – greeting RPC in progress
    *  • AUDIO_STREAMING – duplex audio streaming active
    *  • CALL_END        – goodbye RPC in progress
    *  • ENDED           – call has fully terminated
    * ==========================================================================*/
   export enum CallState {
     IDLE            = "IDLE",
     CALL_START      = "CALL_START",
     AUDIO_STREAMING = "AUDIO_STREAMING",
     CALL_END        = "CALL_END",
     ENDED           = "ENDED",
   }
   
   /** ======================================================================================
    * OutputEvent
    *
    * Enumerates recognition response events:
    *  • EVENT_UNSPECIFIED   – no event
    *  • EVENT_START_OF_INPUT– user speech start detected
    *  • EVENT_END_OF_INPUT  – user speech end detected
    *  • EVENT_NO_MATCH      – no recognition match
    *  • EVENT_NO_INPUT      – silence detected
    * =======================================================================================*/
   export enum OutputEvent {
     EVENT_UNSPECIFIED    = 0,
     EVENT_START_OF_INPUT = 1,
     EVENT_END_OF_INPUT   = 2,
     EVENT_NO_MATCH       = 3,
     EVENT_NO_INPUT       = 4,
   }
   
   /** =======================================================================================
    * ServerMessage
    *
    * Union type for messages received from the server:
    *  • StreamingSpeechInferResponse – successful gRPC response, may include serverTimestamp
    *  • { error, details }            – error object when something goes wrong
    * ========================================================================================*/
   export type ServerMessage =
     | (StreamingSpeechInferResponse & { serverTimestamp?: number })
     | { error: string; details?: string; serverTimestamp?: number };
   
   /** =========================================================================================
    * isErrorMessage
    *
    * Type-guard for server error messages.
    *
    * @param msg – The ServerMessage to test
    * @returns True if msg contains an error property
    * ==========================================================================================*/
   export function isErrorMessage(
     msg: ServerMessage
   ): msg is { error: string; details?: string } {
     return (msg as any).error !== undefined;
   }
   