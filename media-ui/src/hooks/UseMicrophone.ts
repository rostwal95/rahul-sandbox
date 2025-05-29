/**
 * ================================================================
 * Captures raw 16-bit Linear PCM from the user’s microphone via an
 * AudioWorklet processor ("pcm-processor.js").  Manages:
 *   • AudioContext creation/resume at fixed or configured sampleRate
 *   • Loading and wiring of the PCMProcessor worklet
 *   • Posting Uint8Array PCM chunks to the provided callback
 *   • Graceful teardown of all audio resources on unmount
 * ================================================================
 */

import { useEffect, useRef } from "react";
import { APP_PROPERTIES } from "@/config/appProperties";

type AudioCallback = (chunk: Uint8Array) => void;

export interface MicrophoneConfig {
  sampleRate?: number;
}

/**======================================================================
 * 
 * @param onData   Callback invoked with Uint8Array chunks of 16-bit PCM
 * @param config   Optional config: { sampleRate?: number }
 *
 * Sets up an AudioContext (at APP_PROPERTIES.FIXED_SAMPLE_RATE or
 * config.sampleRate), loads the "/pcm-processor.js" worklet,
 * and wires a MediaStream → AudioWorkletNode pipeline.  The
 * worklet posts Uint8Array messages which are delivered via onData.
 * Cleans up tracks, nodes, and context on unmount.
 * ====================================================================== */

export function useMicrophone(
  onData: AudioCallback | null,
  config?: MicrophoneConfig
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    try {
      if (onData !== null && typeof onData !== "function") {
        throw new Error("onData must be a function or null");
      }
      if (
        config?.sampleRate &&
        (typeof config.sampleRate !== "number" || config.sampleRate <= 0)
      ) {
        throw new Error("sampleRate must be a positive number");
      }
      console.log(
        `[${new Date().toISOString()}] Microphone: Initializing with sampleRate: ${config?.sampleRate ||
          APP_PROPERTIES.FIXED_SAMPLE_RATE}`
      );
    } catch (e) {
      console.error(
        `[${new Date().toISOString()}] Microphone: Invalid input: ${String(e)}`
      );
      return () => {};
    }

    async function start() {
      try {
        // Request microphone access
        stream = await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .catch((err) => {
            throw new Error(`Failed to access microphone: ${String(err)}`);
          });
        if (cancelled) {
          console.log(
            `[${new Date().toISOString()}] Microphone: Cancelled before initialization`
          );
          return;
        }
        console.log(
          `[${new Date().toISOString()}] Microphone: Obtained microphone stream`
        );

        // Determine and validate sampleRate
        const sampleRate =
          config?.sampleRate ?? APP_PROPERTIES.FIXED_SAMPLE_RATE;
        if (!Number.isInteger(sampleRate) || sampleRate <= 0) {
          throw new Error(`Invalid sample rate: ${sampleRate}`);
        }

        // Create or reuse AudioContext
        if (!ctxRef.current || ctxRef.current.state === "closed") {
          ctxRef.current = new AudioContext({ sampleRate });
          console.log(
            `[${new Date().toISOString()}] Microphone: Created new AudioContext, state: ${ctxRef.current.state}, requested sampleRate: ${sampleRate}`
          );
        }
        const ctx = ctxRef.current;

        // Resume context if suspended
        await ctx.resume().catch((err) => {
          throw new Error(`Failed to resume AudioContext: ${String(err)}`);
        });
        console.log(
          `[${new Date().toISOString()}] Microphone: Resumed AudioContext`
        );
        console.log(
          `[${new Date().toISOString()}] Microphone: Effective sample rate: ${ctx.sampleRate}`
        );

        // Load the PCM processing worklet
        await ctx.audioWorklet
          .addModule("/pcm-processor.js")
          .catch((err) => {
            throw new Error(`Failed to load PCM processor: ${String(err)}`);
          });
        console.log(
          `[${new Date().toISOString()}] Microphone: Loaded PCM processor`
        );

        // Create source and worklet node
        const src = ctx.createMediaStreamSource(stream);
        srcRef.current = src;
        console.log(
          `[${new Date().toISOString()}] Microphone: Created MediaStreamAudioSourceNode`
        );

        const node = new AudioWorkletNode(ctx, "pcm-processor");
        nodeRef.current = node;
        console.log(
          `[${new Date().toISOString()}] Microphone: Created AudioWorkletNode`
        );

        // Handle incoming PCM messages
        node.port.onmessage = (e) => {
          try {
            if (e.data?.type === "error") {
              console.error(
                `[${new Date().toISOString()}] Microphone: PCMProcessor error: ${e.data.message}`
              );
              return;
            }
            if (onData && e.data?.buffer instanceof ArrayBuffer) {
              onData(new Uint8Array(e.data));
            } else {
              console.warn(
                `[${new Date().toISOString()}] Microphone: Invalid audio data received`
              );
            }
          } catch (err) {
            console.error(
              `[${new Date().toISOString()}] Microphone: Error in onmessage callback: ${String(
                err
              )}`
            );
          }
        };

        // Wire pipeline: mic → worklet → speakers (destination)
        src.connect(node);
        node.connect(ctx.destination);
        console.log(
          `[${new Date().toISOString()}] Microphone: Initialized audio pipeline`
        );
      } catch (err) {
        console.error(
          `[${new Date().toISOString()}] Microphone: Initialization failed: ${String(
            err
          )}`
        );
      }
    }

    // Start pipeline if callback provided
    if (onData) {
      start().catch((err) => {
        console.error(
          `[${new Date().toISOString()}] Microphone: Error starting microphone: ${String(
            err
          )}`
        );
      });
    }

    // Cleanup on unmount
    return () => {
      try {
        cancelled = true;
        if (stream) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
              console.log(
                `[${new Date().toISOString()}] Microphone: Stopped audio track`
              );
            } catch (err) {
              console.warn(
                `[${new Date().toISOString()}] Microphone: Error stopping track: ${String(
                  err
                )}`
              );
            }
          });
        }
        if (nodeRef.current) {
          nodeRef.current.disconnect();
          nodeRef.current.port.onmessage = null;
          console.log(
            `[${new Date().toISOString()}] Microphone: Disconnected AudioWorkletNode`
          );
          nodeRef.current = null;
        }
        if (srcRef.current) {
          srcRef.current.disconnect();
          console.log(
            `[${new Date().toISOString()}] Microphone: Disconnected MediaStreamAudioSourceNode`
          );
          srcRef.current = null;
        }
        if (ctxRef.current && ctxRef.current.state !== "closed") {
          ctxRef.current.close().catch((err) => {
            console.warn(
              `[${new Date().toISOString()}] Microphone: Error closing AudioContext: ${String(
                err
              )}`
            );
          });
          console.log(
            `[${new Date().toISOString()}] Microphone: Closed AudioContext`
          );
        }
        ctxRef.current = null;
        console.log(
          `[${new Date().toISOString()}] Microphone: Cleaned up audio resources`
        );
      } catch (err) {
        console.error(
          `[${new Date().toISOString()}] Microphone: Error during cleanup: ${String(
            err
          )}`
        );
      }
    };
  }, [onData, config?.sampleRate]);
}
