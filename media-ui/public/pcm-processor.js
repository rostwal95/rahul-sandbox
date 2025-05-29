/** ========================================================================
 * PCMProcessor – AudioWorkletProcessor that captures raw audio frames,
 * converts Float32 samples to 16-bit PCM, and posts the resulting
 * Uint8Array to the main thread for further handling.
 *
 * Extends the base AudioWorkletProcessor provided by the Web Audio API.
 * ==========================================================================*/

class PCMProcessor extends AudioWorkletProcessor {
  /** ========================================================================
   * Constructs the PCMProcessor.
   * Any errors during initialization are caught and reported
   * back to the main thread via port.postMessage.
   * ======================================================================== */

  constructor() {
    try {
      super();
      // console.log(
      //   `[${new Date().toISOString()}] PCM: Initialized PCMProcessor`
      // );
    } catch (e) {
      console.error(
        `[${new Date().toISOString()}] PCM: Error initializing PCMProcessor: ${String(e)}`
      );
      this.port.postMessage({
        type: "error",
        message: `Failed to initialize PCMProcessor: ${String(e)}`,
      });
    }
  }

  /**  ========================================================================
   * Processes each incoming audio quantum.
   * Reads the first channel of input, clamps Float32 samples to [-1,1],
   * converts to signed 16-bit integers, and posts them to the main thread.
   *
   * @param {Float32Array[][]} inputs      – Array of input channel arrays
   * @param {Float32Array[][]} outputs     – Array of output channel arrays
   * @param {Object<string, Float32Array>} parameters – AudioParam data
   * @returns {boolean} `true` to keep the processor alive
   *  ========================================================================*/
  process(inputs, outputs, parameters) {
    try {
      if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
        console.log(
          `[${new Date().toISOString()}] PCM: No input data received`
        );
        return true;
      }

      const input = inputs[0];
      if (!input || !Array.isArray(input) || input.length === 0) {
        console.log(
          `[${new Date().toISOString()}] PCM: No input channel data`
        );
        return true;
      }

      const channelData = input[0];
      if (!(channelData instanceof Float32Array) || channelData.length === 0) {
        console.log(
          `[${new Date().toISOString()}] PCM: Invalid or empty channel data`
        );
        return true;
      }

      // console.log(
      //   `[${new Date().toISOString()}] PCM: Processing audio, samples: ${channelData.length}`
      // );
      const int16Buffer = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const buffer = int16Buffer.buffer;
      this.port.postMessage(new Uint8Array(buffer), [buffer]);
      // console.log(
      //   `[${new Date().toISOString()}] PCM: Sent audio buffer, size: ${buffer.byteLength} bytes`
      // );
    } catch (e) {
      console.error(
        `[${new Date().toISOString()}] PCM: Error processing audio: ${String(e)}`
      );
      this.port.postMessage({
        type: "error",
        message: `Error processing audio: ${String(e)}`,
      });
      return true;
    }
    return true;
  }
}

/** ========================================================================
 * Registers the PCMProcessor under the name "pcm-processor".
 * If registration fails, logs the error and notifies the main thread.
 * ========================================================================*/
try {
  registerProcessor("pcm-processor", PCMProcessor);
  // console.log(
  //   `[${new Date().toISOString()}] PCM: Registered PCMProcessor`
  // );
} catch (e) {
  console.error(
    `[${new Date().toISOString()}] PCM: Failed to register PCMProcessor: ${String(e)}`
  );
  self.postMessage({
    type: "error",
    message: `Failed to register PCMProcessor: ${String(e)}`,
  });
}
