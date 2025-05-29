/* ==============================================================================
 * Application-wide constants for audio encoding, sample rates, and user-agent.
 *
 * FIXED_AUDIO_ENCODING  – default encoding for client audio (LINEAR16 or MULAW)
 * FIXED_SAMPLE_RATE      – default sample rate in Hertz
 * DEFAULT_USER_AGENT     – default user‐agent string
 * ==============================================================================*/
export const APP_PROPERTIES = {
  FIXED_AUDIO_ENCODING: "LINEAR16" as "LINEAR16" | "MULAW",
  FIXED_SAMPLE_RATE: 16000,
  DEFAULT_USER_AGENT: "Web-UI",
};