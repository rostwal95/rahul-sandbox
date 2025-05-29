/**
 * =======================================================================
 * TTSPlayer – plays WAV/µ-law audio through Web Audio API
 * with onChunkPlayed hook to tap exactly what reaches output.
 *   • playWavBytes    – queues and plays WAV/µ-law bytes.
 *   • stopAll         – cancels any pending or ongoing playback.
 *   • close           – shuts down the AudioContext.
 *   • onChunkPlayed   – optional callback with raw PCM before playback.
 * ========================================================================
 */

/* Debounced resume to work around browsers auto-suspend behavior */
const debouncedResume = (() => {
  let timer: number | undefined;
  return async (ctx: AudioContext) => {
    if (ctx.state !== "suspended") return;
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => ctx.resume().catch(() => {}), 250);
  };
})();

export class TTSPlayer {
  private readonly audioCtx: AudioContext;
  private queue: Array<{
    bytes: Uint8Array;
    resolve: () => void;
    reject: (err: unknown) => void;
  }> = [];
  private currentSource: AudioBufferSourceNode | null = null;
  public onChunkPlayed?: (pcm: Uint8Array) => void;
  private cancelled = false;
  private isClosing = false;
  public isPlaying = false;

  constructor() {
    this.audioCtx = new AudioContext({ sampleRate: 8000 });
    if (this.audioCtx.state === "suspended") this.audioCtx.resume().catch(() => {});
  }

  /** ===========================================================================
   * Queues and plays a WAV or raw µ-law byte array.
   * @param bytes  Raw WAV bytes or µ-law PCM bytes.
   * ============================================================================*/
  
  public async playWavBytes(bytes: Uint8Array): Promise<void> {
    if (this.isClosing) throw new Error("TTSPlayer is closing");
    if (this.audioCtx.state === "closed") throw new Error("AudioContext closed");
    this.cancelled = false;
    return new Promise((resolve, reject) => {
      this.queue.push({ bytes, resolve, reject });
      if (!this.isPlaying) void this.dequeueAndPlay();
    });
  }

  /** Stops all queued and ongoing playback immediately. */
  public stopAll(): void {
    this.cancelled = true;
    this.currentSource?.stop();
    this.currentSource?.disconnect();
    this.currentSource = null;
    while (this.queue.length) this.queue.shift()!.resolve();
    this.isPlaying = false;
  }

  /** Closes the AudioContext and prevents further playback. */
  public async close(): Promise<void> {
    this.isClosing = true;
    this.stopAll();
    if (this.audioCtx.state !== "closed") {
      await this.audioCtx.close().catch(() => {});
    }
    this.isClosing = false;
  }

  /** Internal loop to dequeue and play each queued item. */
  private async dequeueAndPlay(): Promise<void> {
    if (this.isClosing || this.audioCtx.state === "closed") {
      this.stopAll();
      return;
    }
    const item = this.queue.shift();
    if (!item) {
      this.isPlaying = false;
      return;
    }
    this.isPlaying = true;
    await debouncedResume(this.audioCtx);
    try {
      const buffer = await this.decode(item.bytes);
      if (this.cancelled) {
        item.resolve();
        this.isPlaying = false;
        return this.dequeueAndPlay();
      }

      // Tap raw PCM before playback
      if (this.onChunkPlayed) {
        const f32 = buffer.getChannelData(0);
        const i16 = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
          const v = Math.max(-1, Math.min(1, f32[i]));
          i16[i] = v * 0x7fff;
        }
        this.onChunkPlayed(new Uint8Array(i16.buffer));
      }

      const src = this.audioCtx.createBufferSource();
      this.currentSource = src;
      src.buffer = buffer;
      src.connect(this.audioCtx.destination);
      src.onended = () => {
        this.currentSource = null;
        this.isPlaying = false;
        item.resolve();
        void this.dequeueAndPlay();
      };
      src.start();
    } catch (e) {
      item.reject(e);
      this.isPlaying = false;
      this.currentSource = null;
      void this.dequeueAndPlay();
    }
  }

  /** Decodes either WAV or raw µ-law bytes into an AudioBuffer. */
  private async decode(bytes: Uint8Array): Promise<AudioBuffer> {
    const isWav = new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF";
    let arr: ArrayBuffer;
    if (isWav) {
      arr = bytes.slice().buffer;
    } else {
      const hdr = this.createWavHeader(bytes.length, 8000, 1, 8);
      const full = new Uint8Array(hdr.length + bytes.length);
      full.set(hdr, 0);
      full.set(bytes, hdr.length);
      arr = full.buffer;
    }
    return new Promise((res, rej) =>
      this.audioCtx.decodeAudioData(arr, res, (e) =>
        rej(new Error(`decodeAudioData failed: ${String(e)}`))
      )
    );
  }

  /** Builds a minimal WAV header for raw PCM data. */
  private createWavHeader(
    dataLen: number,
    rate: number,
    channels: number,
    bits: number
  ): Uint8Array {
    const h = new Uint8Array(44);
    const v = new DataView(h.buffer);
    h.set([82, 73, 70, 70]);
    v.setUint32(4, 36 + dataLen, true);
    h.set([87, 65, 86, 69], 8);
    h.set([102, 109, 116, 32], 12);
    v.setUint32(16, 16, true);
    v.setUint16(20, bits === 8 ? 7 : 1, true);
    v.setUint16(22, channels, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * channels * (bits / 8), true);
    v.setUint16(32, channels * (bits / 8), true);
    v.setUint16(34, bits, true);
    h.set([100, 97, 116, 97], 36);
    v.setUint32(40, dataLen, true);
    return h;
  }
}
