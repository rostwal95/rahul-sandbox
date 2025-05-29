/**
 * ========================================================================================
 * Accumulates and mixes 16-bit PCM segments into a single timeline, then exports as WAV.
 *   • addSegment(offsetMs, pcm): overlays a PCM segment at the given millisecond offset.
 *   • toWav(): constructs a standard PCM WAV Blob from the mixed buffer.
 *
 * Usage:
 *   const builder = new RecordingBuilder();
 *   builder.addSegment(0, pcmSegment1);
 *   builder.addSegment(500, pcmSegment2);
 *   const wavBlob = builder.toWav();
 * =========================================================================================
 */
export class RecordingBuilder {
    private readonly sr = 16_000;
    private buf = new Int16Array(0);
  
    /** =====================================================================================
     * Overlays a 16-bit PCM buffer onto the internal mix at the specified offset.
     *
     * @param offsetMs  Millisecond offset at which to start mixing this segment.
     * @param pcm       Int16Array of PCM samples to mix.
     * =====================================================================================*/

    addSegment(offsetMs: number, pcm: Int16Array) {
      const start = Math.floor((offsetMs * this.sr) / 1000);
      const end = start + pcm.length;
      if (end > this.buf.length) {
        const tmp = new Int16Array(end);
        tmp.set(this.buf);
        this.buf = tmp;
      }
      for (let i = 0; i < pcm.length; i++) {
        const idx = start + i;
        let s = this.buf[idx] + pcm[i];
        // clamp to 16-bit signed range
        if (s > 32767) s = 32767;
        if (s < -32768) s = -32768;
        this.buf[idx] = s;
      }
    }
  
    /** =======================================================================================
     * Exports the mixed PCM buffer as a standard 16-bit PCM WAV Blob.
     *
     * @returns  Blob of type "audio/wav" containing the mixed audio.
     * ======================================================================================== */
    toWav(): Blob { 
      const pcm = new Uint8Array(this.buf.buffer);
      const hdr = new ArrayBuffer(44);
      const dv = new DataView(hdr);
      const u16 = (o: number, v: number) => dv.setUint16(o, v, true);
      const u32 = (o: number, v: number) => dv.setUint32(o, v, true);
  
      u32(0, 0x46464952);               // "RIFF"
      u32(4, 36 + pcm.length);          // file length
      u32(8, 0x45564157);               // "WAVE"
      u32(12, 0x20746d66);              // "fmt "
      u32(16, 16);                      // fmt chunk size
      u16(20, 1);                       // audio format = PCM
      u16(22, 1);                       // channels = 1
      u32(24, this.sr);                 // sample rate
      u32(28, this.sr * 2);             // byte rate = sampleRate * blockAlign
      u16(32, 2);                       // block align = channels * bytesPerSample
      u16(34, 16);                      // bits per sample
      u32(36, 0x61746164);              // "data"
      u32(40, pcm.length);              // data chunk length
  
      return new Blob([hdr, pcm], { type: "audio/wav" });
    }
  }