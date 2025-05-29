/** ==============================================================================
 * AudioWorkletProcessor
 *
 * Base class for implementing custom audio processing in an AudioWorklet.
 *
 * Subclasses must implement the `process` method to handle audio input/output
 * and may communicate with the main thread via `port.postMessage`.
 * 
 * See: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
 * ================================================================================*/
declare abstract class AudioWorkletProcessor {
  /** MessagePort for bi-directional communication with main thread. */
  readonly port: MessagePort;

  /** Creates a new processor instance. */
  constructor();

  /**
   * Called for each audio render quantum (typically 128 frames).
   *
   * @param inputs     – Array of input channel data
   * @param outputs    – Array of output channel data
   * @param parameters – Map of AudioParam data arrays
   * @returns `true` to keep the processor alive, `false` to terminate it
   */
  abstract process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: { [key: string]: Float32Array }
  ): boolean;
}

/** =============================================================================
 * registerProcessor
 *
 * Registers a custom processor class under a given name so it can be
 * instantiated in an AudioWorkletNode.
 *
 * @param name           – Identifier used in `new AudioWorkletNode(ctx, name)`
 * @param processorCtor  – Constructor of the processor subclass
 * ==============================================================================*/
declare function registerProcessor(
  name: string,
  processorCtor: typeof AudioWorkletProcessor
): void;
