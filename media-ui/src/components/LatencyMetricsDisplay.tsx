/* ======================================================================
            Detailed call & dialogue metrics
   =====================================================================*/

import React from "react";
import { clsx } from "clsx";

/** ======================================================================
  * Records per-dialogue timing, counts, and flags.
  =======================================================================*/
export interface DialogueMetrics {
  dialogueNumber: number;

  /* ASR */
  startOfInput?: number;
  firstInterimReceived?: number;
  finalRecognitionReceived?: number;
  endOfInput?: number;

  /* VA playback */
  firstPromptByteReceived?: number;
  firstPlaybackStart?: number;
  promptBytes?: number;              // bytes
  totalPromptPlaybackTime: number;   // seconds

  /* misc */
  bargeinable: boolean;
  audioChunksSent: number;
  customerUtteranceLength?: number;
  interimPlayoutLength?: number;
  silenceGap1?: number;
  silenceGap2?: number;
  bargeInLatency?: number;
  bargeInStart?: number;
}

/** ======================================================================
  * Aggregated call-level metrics
  =======================================================================*/
export interface LatencyMetrics {
  callStart?: number;         
  callStartRequest?: number;   
  callStartResponse?: number;
  callStartLatency?: number;
  callEnd?: number;

  greetingPromptBytes?: number;
  greetingPlaybackTime?: number;

  dialogues: DialogueMetrics[];
}

/** ======================================================================
  * Component props
  =======================================================================*/
export interface LatencyMetricsDisplayProps {
  latencyMetrics: LatencyMetrics;
}

/* ------------------------------ helpers ------------------------------- */
const fmtTime = (ts: number) => {
  const d = new Date(ts);
  const hh = d.getHours() % 12 || 12;
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${hh.toString().padStart(2, "0")}:${mm}:${ss}:${ms} ${
    d.getHours() >= 12 ? "PM" : "AM"
  }`;
};
const diffMs = (a?: number, b?: number) =>
  !a || !b ? 0 : Math.max(0, b - a);

/** One-liner row for timestamps + delta */
const RowTime = ({
  label,
  base,
  ts,
}: {
  label: string;
  base?: number;
  ts?: number;
}) =>
  ts === undefined ? null : (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 bg-teal-200 rounded-full" />
      <span>
        {label}: {fmtTime(ts)}
        {base && ts && base !== ts && (
          <> ({diffMs(base, ts).toLocaleString()} ms)</>
        )}
      </span>
    </div>
  );

/** Generic numeric row */
const RowVal = ({
  label,
  value,
  unit = "ms",
}: {
  label: string;
  value?: number;
  unit?: "ms" | "s" | "kb" | "count";
}) =>
  value === undefined ? null : (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 bg-teal-200 rounded-full" />
      <span>
        {label}:{" "}
        {unit === "count"
          ? value.toLocaleString()
          : unit === "kb"
          ? `${value.toFixed(1)} KB`
          : unit === "s"
          ? `${value.toFixed(2)} s`
          : `${value.toLocaleString()} ms`}
      </span>
    </div>
  );

/* ----------------------------- component --------------------------------- */

const LatencyMetricsDisplay: React.FC<LatencyMetricsDisplayProps> = ({
  latencyMetrics,
}) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Call&nbsp;Latency&nbsp;Metrics
    </h3>

    {/* ─────────────────────── Call-Start card ──────────────────────────── */}
    {latencyMetrics.callStart && (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-base font-semibold text-gray-700 mb-2">
          Call&nbsp;Start
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <RowTime
            label="Start-Call Request"
            ts={latencyMetrics.callStart}
          />
          <RowTime
            label="First VA Response"
            base={latencyMetrics.callStart}
            ts={latencyMetrics.dialogues[0]?.firstPlaybackStart}
          />
          <RowVal
            label="Greeting Prompt Length"
            value={
              latencyMetrics.greetingPromptBytes &&
              latencyMetrics.greetingPromptBytes / 1024
            }
            unit="kb"
          />
          <RowVal
            label="Greeting Playback Time"
            value={
              latencyMetrics.greetingPlaybackTime &&
              latencyMetrics.greetingPlaybackTime
            }
            unit="s"
          />
        </div>
      </div>
    )}

    {/* ─────────────────────────── Per-dialogue cards ──────────────────────────── */}

    {latencyMetrics.dialogues.map((d) => (
      <div
        key={d.dialogueNumber}
        className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm"
      >
        <h4 className="text-base font-semibold text-gray-700 mb-2">
          Dialogue&nbsp;{d.dialogueNumber}
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <RowTime label="Start of Input" ts={d.startOfInput} />
          <RowTime
            label="First Interim"
            base={d.startOfInput}
            ts={d.firstInterimReceived}
          />
          <RowTime
            label="End of Input"
            base={d.startOfInput}
            ts={d.endOfInput}
          />
          <RowVal
            label="Customer Utterance"
            value={d.customerUtteranceLength}
            unit="s"
          />
          <RowTime
            label="First Prompt Byte"
            base={d.startOfInput}
            ts={d.firstPromptByteReceived}
          />
          <RowTime
            label="First Playback Start"
            base={d.startOfInput}
            ts={d.firstPlaybackStart}
          />
          <RowVal
            label="Prompt Length"
            value={d.promptBytes && d.promptBytes / 1024}
            unit="kb"
          />
          <RowVal
            label="Prompt Playback Time"
            value={d.totalPromptPlaybackTime}
            unit="s"
          />
          <RowVal
            label="Interim → Final Latency"
            value={d.interimPlayoutLength}
            unit="s"
          />
          <RowVal
            label="Silence Gap 1"
            value={d.silenceGap1}
            unit="s"
          />
          <RowVal
            label="Silence Gap 2"
            value={d.silenceGap2}
            unit="s"
          />
          <RowVal
            label="Barge-in Latency"
            value={d.bargeInLatency}
            unit="s"
          />
          <RowVal
            label="Audio Chunks Sent"
            value={d.audioChunksSent}
            unit="count"
          />

          {/* barge-inable flag */}
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "w-4 h-4 rounded-full",
                d.bargeinable ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span>Barge-inable: {d.bargeinable ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>
    ))}

    {/* ────────────────────────────── Call-End card ────────────────────────────── */}
    {latencyMetrics.callEnd && (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-base font-semibold text-gray-700 mb-2">
          Call&nbsp;End
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <RowTime label="Call End" ts={latencyMetrics.callEnd} />
          <RowVal
            label="Call-End Latency"
            value={
              latencyMetrics.dialogues.at(-1)?.endOfInput &&
              diffMs(
                latencyMetrics.dialogues.at(-1)!.endOfInput,
                latencyMetrics.callEnd
              ) / 1000
            }
            unit="s"
          />
        </div>
      </div>
    )}
  </div>
);

export default LatencyMetricsDisplay;
