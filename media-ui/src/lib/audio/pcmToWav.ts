/**
 * ==============================================================================
 * Converts an array of µ-law (8 kHz, mono) PCM chunks into a playable WAV Blob.
 *   • Flattens the input chunks into one contiguous data buffer.
 *   • Prepends a 44-byte minimal WAV header configured for µ-law encoding.
 *
 * @param chunks  Array of Uint8Array containing µ-law encoded PCM data.
 * @returns       Blob of type "audio/wav" ready for playback.
 * ==============================================================================
 */
export function pcmChunksToWav(chunks: Uint8Array[]): Blob {
  // Concatenate all chunks into a single data buffer
  const bytes = chunks.reduce((n, b) => n + b.length, 0);
  const data = new Uint8Array(bytes);
  let off = 0;
  for (const b of chunks) {
    data.set(b, off);
    off += b.length;
  }

  // Build minimal WAV header for µ-law, 8 kHz, mono
  const hdr = new Uint8Array(44);
  const v = new DataView(hdr.buffer);
  hdr.set([82, 73, 70, 70]);               // "RIFF"
  v.setUint32(4, 36 + bytes, true);        // file length
  hdr.set([87, 65, 86, 69], 8);            // "WAVE"
  hdr.set([102, 109, 116, 32], 12);        // "fmt "
  v.setUint32(16, 16, true);               // fmt chunk size (16)
  v.setUint16(20, 7, true);                // audio format = µ-law (7)
  v.setUint16(22, 1, true);                // channels = 1
  v.setUint32(24, 8000, true);             // sample rate = 8000 Hz
  v.setUint32(28, 8000, true);             // byte rate = sampleRate * 1
  v.setUint16(32, 1, true);                // block align = 1 byte/frame
  v.setUint16(34, 8, true);                // bits per sample = 8
  hdr.set([100, 97, 116, 97], 36);         // "data"
  v.setUint32(40, bytes, true);            // data chunk length

  return new Blob([hdr, data], { type: "audio/wav" });
}