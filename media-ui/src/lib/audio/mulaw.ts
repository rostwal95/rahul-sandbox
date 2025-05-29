/**
 * ========================================================================
 * Converts a single μ-law encoded byte into a 16-bit signed PCM sample.
 *
 * @param b  The μ-law byte (0–255)
 * @returns  The decoded 16-bit PCM sample
 * ========================================================================
 */
export function decodeMuLaw(b: number): number {
    // Invert bits and mask to 8-bit
    b = ~b & 0xff;
    // Extract sign
    const sign = b & 0x80 ? -1 : 1;
    // Extract exponent and mantissa fields
    const exp = (b >> 4) & 0x07;
    const mant = b & 0x0f;
    // Reconstruct PCM magnitude
    const pcm = ((mant << 1) + 33) << (exp + 2);
    // Apply sign and bias correction
    return sign * (pcm - 0x84);
  }
  
  /**
   * ======================================================================
   * Batch-decodes an array of μ-law bytes into a 16-bit PCM Int16Array.
   *
   * @param chunk  Uint8Array of μ-law encoded bytes
   * @returns      Int16Array of decoded 16-bit PCM samples
   * ======================================================================
   */
  export function decodeMuLawChunk(chunk: Uint8Array): Int16Array {
    const out = new Int16Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      out[i] = decodeMuLaw(chunk[i]);
    }
    return out;
  }
  