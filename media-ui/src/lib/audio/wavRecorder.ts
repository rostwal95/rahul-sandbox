/**
 * ===========================================================================
 * PCM to WAV conversion utilities.
 *   • pcmChunksToWav – flattens 16-bit PCM chunks into a standard WAV Blob.
 * ==========================================================================*/

/** ===========================================================================
 * Converts 16-bit PCM chunks (Uint8Array arrays) into a single WAV Blob.
 *
 * @param chunks      Array of Uint8Array containing 16-bit PCM @sampleRate.
 * @param sampleRate  Output sample rate, defaults to 16000 Hz.
 * @returns           Blob of type "audio/wav" ready for playback or download.
 *  =========================================================================== */

export async function pcmChunksToWav(
  chunks: Uint8Array[],
  sampleRate = 16_000
): Promise<Blob> {
  // Flatten into one contiguous PCM buffer
  const pcmLen = chunks.reduce((n, b) => n + b.length, 0);
  const pcm = new Uint8Array(pcmLen);
  let off = 0;
  for (const c of chunks) {
    pcm.set(c, off);
    off += c.length;
  }

  // Build 44-byte RIFF WAV header
  const header = new ArrayBuffer(44);
  const dv = new DataView(header);
  const u16 = (o: number, v: number) => dv.setUint16(o, v, true);
  const u32 = (o: number, v: number) => dv.setUint32(o, v, true);

  u32(0, 0x46464952);            // "RIFF"
  u32(4, 36 + pcm.length);       // file length
  u32(8, 0x45564157);            // "WAVE"
  u32(12, 0x20746d66);           // "fmt "
  u32(16, 16);                   // fmt chunk size
  u16(20, 1);                    // audio format = PCM
  u16(22, 1);                    // channels = 1
  u32(24, sampleRate);           // sample rate
  u32(28, sampleRate * 2);       // byte rate = sampleRate * blockAlign
  u16(32, 2);                    // block align = channels * bytesPerSample
  u16(34, 16);                   // bits per sample
  u32(36, 0x61746164);           // "data"
  u32(40, pcm.length);           // data chunk length

  return new Blob([header, pcm], { type: "audio/wav" });
}
