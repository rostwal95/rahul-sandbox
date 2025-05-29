/** ===================================================================*
  *   ChatBotUI.tsx – user-facing chat interface with controls         *
  * ================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { Config } from "./ConfigScreen";
import ChatBubble from "./ChatBubble";
import { ChatControls } from "./ChatControls";
import ConnectionIndicator from "./ConnectionIndicator";
import KibanaLink from "./KibanaLink";
import RecordingChips from "./RecordingChips";

import { useMicrophone } from "@/hooks/UseMicrophone";
import { CallStateMachine } from "@/state/CallStateMachine";
import { CallState, isErrorMessage } from "@/state/types";
import { ServerMessage } from "@/state/types";
import { Prompt } from "@/grpc/generated/virtualagent_pb";
import { LatencyMetrics } from "./LatencyMetricsDisplay";

/** =====================================================================*
 *           helpers for per-call log file                               *
 * ======================================================================*/

const now = () => new Date().toISOString();

/** =====================================================================*
 *    scrubs any audio payloads so the log is safe for the user          *
 * ======================================================================*/
function scrubObj(o: any): void {
  if (!o || typeof o !== "object") return;

  if (Object.prototype.hasOwnProperty.call(o, "audioContent")) {
    const raw = o.audioContent;
    const bytes =
      typeof raw === "string"
        ? Math.floor((raw.length * 3) / 4)
        : (raw as Uint8Array).length;
    o.audioContent = `[bytes=${bytes}]`;
  }
  if (o.streamSpeechRequest?.case === "audioContent") {
    const v = o.streamSpeechRequest.value;
    const bytes =
      typeof v === "string"
        ? Math.floor((v.length * 3) / 4)
        : (v as Uint8Array).length;
    o.streamSpeechRequest.value = `[bytes=${bytes}]`;
  }
  if (Array.isArray(o)) o.forEach(scrubObj);
  else Object.values(o).forEach(scrubObj);
}

/** =======================================================================*
 *        Simple container for each chat bubble's metadata.                * 
 * ========================================================================*/
export interface ChatMessage {
  id: string;
  sender: "user" | "Autonomous Agent";
  text: string;
  timestamp: string;
}

/** ========================================================================*
 *                         ChatBotUI Props                                  *
 * =========================================================================*/
interface Props {
  config: Config;
  onResetConfig: () => void;
  onMessagesUpdate?: (m: ChatMessage[]) => void;
  onMetricsUpdate?: (m: LatencyMetrics) => void;
}

/* ==========================================================================*
    * Renders the chat timeline, microphone controls, connection status,     *
    * and handles integration with CallStateMachine.                         *
    *  • Displays ChatBubble for each message                                *
    *  • Manages FSM start/end, mic toggling, and ASR/VA callbacks           *
    *  • Auto-scrolls, tracks duration, and lifts state up via callbacks     *
  ===========================================================================*/

const ChatBotUI: React.FC<Props> = ({
  config,
  onResetConfig,
  onMessagesUpdate,
  onMetricsUpdate,
}) => {

  /* ========================================================================*
   *                        component state                                  *
   * ========================================================================*/
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [err, setErr] = useState("");
  const [state, setState] = useState<CallState>(CallState.IDLE);
  const [mic, setMic] = useState(false);
  const [conn, setConn] = useState(false);
  const [dur, setDur] = useState<number | null>(null);
  const [files, setFiles] = useState<{ label: string; blob: Blob }[]>([]);
  const logLines = useRef<string[]>([]);

  /* ========================================================================*
   *                           refs                                          *
   * ========================================================================*/
  const fsm = useRef<CallStateMachine | null>(null);
  const counter = useRef(0);
  const liveId = useRef<string | null>(null);
  const lastUser = useRef("");
  const lastBot = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ==========================================================================*
   *                        formatting helpers                                 *
   * =========================================================================*/
  const fmtDur = (s: number | null) =>
    s == null
      ? "0:00"
      : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const fmtStamp = (d: Date) => {
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    const base = d.toLocaleTimeString(undefined, { hour12: true });
    return base.replace(/(\d+:\d+:\d+)(.*)/, `$1:${ms}$2`);
  };

  /** ==========================================================================
   *      Appends a new ChatMessage, returns its id for live updates.  
   *  =========================================================================*/
  const addMsg = (
    who: "user" | "Autonomous Agent",
    txt: string,
    ts?: number
  ): string => {
    const id = `${who}-${Date.now()}-${counter.current++}`;
    setMsgs((p) => [
      ...p,
      {
        id,
        sender: who,
        text: txt,
        timestamp: fmtStamp(new Date(ts ?? Date.now())),
      },
    ]);
    return id;
  };

  /* =============================================================================
   *                          lift messages up                          
   * ============================================================================*/

  useEffect(() => {
    onMessagesUpdate?.(msgs);
  }, [msgs, onMessagesUpdate]);

  /**==============================================================================
     * Callback from FSM for every incoming gRPC message.
     *  • Updates ASR interim/final in the UI
     *  • Triggers VA prompts + playback
     *  • Syncs FSM state, mic & metrics
   * =============================================================================*/

  const onServer = (msg: ServerMessage) => {
    try {
      const clone =
        typeof structuredClone === "function"
          ? structuredClone(msg)
          : JSON.parse(JSON.stringify(msg));
      scrubObj(clone);
      logLines.current.push(`[${now()}] ${JSON.stringify(clone)}`);
    } catch {
      /* ignore */
    }

    if (isErrorMessage(msg)) {
      setErr(msg.error);
      setMic(false);
      setConn(false);
      return;
    }
    setConn(true);

    /* ==================================================================== *
     *  helper: push **unique** VA text to timeline                         *
     * ==================================================================== */
  const pushVA = (p: Prompt, ts?: number) => {
    if (!p.text) return;
    const norm = p.text.trim().toLowerCase();
    if (norm === lastBot.current) return;            
    lastBot.current = norm;
    addMsg("Autonomous Agent", p.text, ts);
  };

    /* handle ASR */
    const rec = msg.inferInsightResponse?.recognitionResult;
    if (rec?.alternatives?.length) {
      const text = rec.alternatives[0].transcript;
      if (!rec.isFinal) {
        if (liveId.current) {
          setMsgs((p) =>
            p.map((b) => (b.id === liveId.current ? { ...b, text } : b))
          );
        } else {
          liveId.current = addMsg("user", text);
        }
        return;
      }
      if (liveId.current) {
        setMsgs((p) =>
          p.map((b) =>
            b.id === liveId.current
              ? {
                  ...b,
                  text,
                  timestamp: fmtStamp(
                    new Date(msg.serverTimestamp ?? Date.now())
                  ),
                }
              : b
          )
        );
      } else {
        const last = msgs.at(-1);
        if (!(last && last.sender === "user" && last.text === text)) {
          addMsg("user", text, msg.serverTimestamp);
        }
      }
      lastUser.current = text.trim().toLowerCase();
      liveId.current = null;
    }

    /* handle VA prompts */
    const va = msg.inferInsightResponse?.virtualAgentResult;
    if (va?.prompts?.length) {
      liveId.current = null;
      setMic(true);
      va.prompts.forEach((p: Prompt) => {
        pushVA(p, msg.serverTimestamp);      
        if (p.audioContent?.length && state === CallState.AUDIO_STREAMING) {
          fsm.current?.playPrompts([p]).catch((e) => setErr(String(e)));
        }
      });
    }

    /* sync FSM state */
    if (fsm.current) {
      setState(fsm.current.getState());
      setDur(fsm.current.getCallDuration());
      onMetricsUpdate?.(fsm.current.getLatencyMetrics());
    }
  };

  /* ==================================================================== *
   *                      initialize FSM on mount                         *
   * ==================================================================== */
  useEffect(() => {
    fsm.current = new CallStateMachine(config, onServer);
    return () => {
      void fsm.current?.closeAll();
    };
  }, [config]);

  /* ====================================================================== *
   *                   auto-scroll chat window                              *
   * ====================================================================== */

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /** ====================================================================== *
   *  microphone hook                                                        *
   *  Streams audio when in AUDIO_STREAMING and mic is ON                    *
   * ======================================================================= */

  useMicrophone(
    (state === CallState.CALL_START || state === CallState.AUDIO_STREAMING) &&
      mic
      ? (b) => fsm.current?.sendAudioChunk(b).catch((e) => setErr(String(e)))
      : null
  );

  /* =======================================================================*
   *                      call duration ticker                              *
   * =======================================================================*/
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (state !== CallState.ENDED) {
      timerRef.current = setInterval(
        () => setDur(fsm.current?.getCallDuration() ?? null),
        1000
      );
    }
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [state]);

  /** =======================================================================*
   *  Begins the call: resets error, messages, recordings, then              *
   *  invokes FSM.startCall().                                               *
   * ========================================================================*/
  const start = async () => {
    setErr("");
    setMsgs([]);
    setFiles([]);
    logLines.current = [];
    await fsm.current!.startCall().catch((e) => setErr(String(e)));
  };

  /** =========================================================================*
   *  Ends the call: awaits FSM.endCall(), collects mixed recording,           *
   *  and transitions UI to ENDED state.                                       *
   * ==========================================================================*/
  const end = async () => {
    try {
      const rec = await fsm.current!.endCall();
      const arr: { label: string; blob: Blob }[] = [];

      /* build a wav file with both caller and agent audio */
      if (rec.mixed)
        arr.push({ label: `${rec.convId}-mixed.wav`, blob: rec.mixed });

      /* build plain-text log file */
      const logBlob = new Blob([logLines.current.join("\n")], {
        type: "text/plain",
      });
      //arr.push({ label: `${config.conversationId}-logs.txt`, blob: logBlob });
      arr.push({ label: `backend-logs.txt`, blob: logBlob });

      setFiles(arr);
      setState(CallState.ENDED);
    } catch (e) {
      setErr(String(e));
    } finally {
      setMic(false);
      setConn(false);
    }
  };

  /** ====================================================================== *
   *        Flips microphone on/off when in streaming state.                 *
   * ======================================================================= */
  const toggleMic = () =>
    state === CallState.AUDIO_STREAMING && setMic((p) => !p);

  /* ======================================================================= *
   *                       header extras                                     *
   * ======================================================================= */
  let extras: React.ReactNode = null;
  if (state === CallState.CALL_START || state === CallState.AUDIO_STREAMING) {
    extras = <KibanaLink cfg={config} />;
  } else if (state === CallState.ENDED) {
    extras = (
      <div className="flex gap-3">
        <KibanaLink cfg={config} />
        <RecordingChips files={files} />
      </div>
    );
  }


  /* ========================================================================= *
   *                            render                                         *
   * ========================================================================= */
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-[780px] h-[85vh] flex flex-col">
      {/* header */}
      <div className="bg-gray-700 text-white p-4 rounded-lg mb-4">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <span className="font-semibold">Autonomous Agent</span>
          <span className="text-sm">Duration {fmtDur(dur)}</span>
          <ConnectionIndicator connected={conn && !err} />
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm"
            onClick={onResetConfig}
          >
            Change Config
          </button>
        </div>

        <div className="text-xs leading-relaxed flex flex-wrap gap-x-4 gap-y-1 mt-3">
          <span>
            <b>Host</b>: {config.host}
          </span>
          <span>
            <b>Language</b>: {config.language}
          </span>
          <span>
            <b>Cluster</b>: {config.wxccClusterId}
          </span>
          <span>
            <b>UserAgent</b>: {config.userAgent}
          </span>
          <span>
            <b>ConversationId</b>: {config.conversationId}
          </span>
          <span>
            <b>OrgId</b>: {config.orgId}
          </span>
          <span>
            <b>VirtualAgentId</b>: {config.virtualAgentId}
          </span>
        </div>
      </div>

      {/* server error */}
      {err && (
        <div className="bg-red-100 text-red-800 p-2 mb-2 rounded text-sm">
          Server error: {err}
        </div>
      )}

      {/* chat window */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100 rounded-lg mb-2">
        {msgs.map((m) => (
          <ChatBubble key={m.id} {...m} />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* controls */}
      <ChatControls
        className="w-full"
        callState={
          state === CallState.IDLE
            ? "idle"
            : state === CallState.ENDED
             ? "ended"
            : "streaming"
        }

        micActive={mic}
        onToggleMic={() =>
          (state === CallState.CALL_START || state === CallState.AUDIO_STREAMING) &&
          setMic((p) => !p) 
        }
        onStart={start}
        onEnd={end}
        micBtnClass="bg-gray-300 hover:bg-gray-400 text-gray-700"
        startBtnClass="bg-indigo-600 hover:bg-indigo-700 text-white"
        endBtnClass="bg-red-500 hover:bg-red-600 text-white"
        extra={extras}
      />
    </div>
  );
};

export default ChatBotUI;
