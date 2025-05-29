/* =============================================================== 
   CallStateMachine – orchestrates a single VA call (audio + TTS)
   =============================================================== */

import { Config } from "@/components/ConfigScreen";
import { TTSPlayer } from "@/lib/audio/TTSPlayer";
import {
  StreamingSpeechInferRequest,
  InferInsightResponse,
  RecognitionConfig_AudioEncoding,
} from "@/grpc/generated/InsightInfer_pb";
import {
  VirtualAgentResult,
  Prompt,
  VirtualAgentResult_ResponseType,
} from "@/grpc/generated/virtualagent_pb";
import {
  ServerMessage,
  StreamingCall,
  bridgingClient,
} from "@/grpc/bridgingClient";
import { CallState, OutputEvent, isErrorMessage } from "./types";
import { OutputAudioEncoding } from "@/grpc/generated/tts_pb";
import { v4 as uuidv4 } from "uuid";
import {
  LatencyMetrics,
  DialogueMetrics,
} from "@/components/LatencyMetricsDisplay";
import { pcmChunksToWav as wav16k } from "@/lib/audio/wavRecorder";
import { RecordingBuilder } from "@/lib/audio/recordingBuilder";

/* ───────────────────────── helpers ──────────────────────────── */
const mapAudioEncoding = (enc: string): RecognitionConfig_AudioEncoding =>
  enc === "MULAW"
    ? RecognitionConfig_AudioEncoding.MULAW
    : RecognitionConfig_AudioEncoding.LINEAR16;

/* ───────────────────────── typed buffers ───────────────────────── */
interface TimedUint8 {
  ts: number;
  data: Uint8Array;
}
interface TimedInt16 {
  ts: number;
  data: Int16Array;
}

/** ====================================================================
    * Orchestrates the full life-cycle of a single voice-call session.
 * ===================================================================== */

export class CallStateMachine {
  /* ======================== immutable =========================== */
  private readonly legId = uuidv4();
  public readonly config: Config;
  private readonly pushToUI: (m: ServerMessage) => void;

  /* ========================= live state ========================= */
  private state: CallState = CallState.IDLE;
  private readonly tts = new TTSPlayer();

  private callStartRpc: StreamingCall | null = null;
  private audioRpc: StreamingCall | null = null;
  private callEndRpc: StreamingCall | null = null;

  private gotGreeting = false;
  private greetingFinished!: Promise<void>;
  private finishGreeting!: () => void;

  private awaitingVaAfterEoi = false;
  private playedPromptKeys = new Set<string>();
  private initialPromptsPlayed = false;

  /* ========================= latency log ======================== */
  private latency: LatencyMetrics = { dialogues: [] };
  private curDlg: DialogueMetrics | null = null;
  private dlgNum = 0;

  /* =========================== timing =========================== */
  private callStartTime!: number;
  private callEndTime: number | null = null;

  /* ==================== buffering & capture ===================== */
  private micBuf: Uint8Array[] = [];
  private bufTimer: number | null = null;

  private callerPcm: TimedUint8[] = [];
  private agentPcm: TimedInt16[] = [];

  /* ==================================================================
   *                           constructor
   * ================================================================== */

  constructor(cfg: Config, uiCb: (m: ServerMessage) => void) {
    this.config = cfg;
    this.pushToUI = uiCb;

    this.greetingFinished = new Promise<void>(
      (res) => (this.finishGreeting = res)
    );

    /** Capture first-byte TTS timing & up-sample audio from 8 kHz → 16 kHz */
    this.tts.onChunkPlayed = (bytes) => {
      if (this.curDlg && !this.curDlg.firstPromptByteReceived) {
        this.curDlg.firstPromptByteReceived = Date.now();
        this.curDlg.firstPlaybackStart = this.curDlg.firstPromptByteReceived;
      }
      const src = new Int16Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength >> 1
      );
      const dst = new Int16Array(src.length * 2);
      for (let i = 0; i < src.length; i++) {
        dst[i * 2] = src[i];
        dst[i * 2 + 1] = src[i];
      }
      this.agentPcm.push({ ts: Date.now(), data: dst });
    };
  }

  /* =========================================================================
   * PUBLIC API – state, duration, metrics
   * ========================================================================*/

  getState = () => this.state;
  getLatencyMetrics = () => this.latency;
  getCallDuration = () =>
    this.state === CallState.IDLE
      ? null
      : ((this.callEndTime ?? Date.now()) - this.callStartTime) / 1000;

  /** ========================================================================
   * getRecordings
   * ========================================================================*/
  public async getRecordings() {
    const callerWav = this.callerPcm.length
      ? await wav16k(
          this.callerPcm.map((c) => c.data),
          16_000
        )
      : null;

    const agentWav = this.agentPcm.length
      ? await wav16k(
          this.agentPcm.map((a) => new Uint8Array(a.data.buffer)),
          16_000
        )
      : null;

    /* Mix with real-time offsets */
    let mixed: Blob | null = null;
    try {
      const mix = new RecordingBuilder();
      for (const c of this.callerPcm)
        mix.addSegment(
          c.ts - this.callStartTime,
          new Int16Array(c.data.buffer)
        );
      for (const a of this.agentPcm)
        mix.addSegment(a.ts - this.callStartTime, a.data);
      mixed = mix.toWav();
    } catch {
      /* ignore */
    }

    return {
      convId: this.config.conversationId,
      caller: callerWav,
      agent: agentWav,
      mixed,
    };
  }

  /** =========================================================================
   * startCall
   * ==========================================================================*/
  public async startCall() {
    if (this.state !== CallState.IDLE) throw new Error("Not idle");

    this.state = CallState.CALL_START;
    this.callStartTime = Date.now();
    this.latency.callStart = this.callStartTime;             
    this.latency.callStartRequest = Date.now();

    this.callStartRpc = await this.openGrpcStream("complete", { eventType: 1 });

    await this.callStartRpc.send(
      new StreamingSpeechInferRequest({
        streamSpeechRequest: {
          case: "streamingConfig",
          value: {
            config: {
              encoding: mapAudioEncoding("LINEAR16"),
              sampleRateHertz: 16_000,
              languageCode: this.config.language,
            },
          },
        },
      }),
      true
    );

    await this.sendInsightConfig(this.callStartRpc, 1);

    /* wait until first VA prompt arrives */
    const t0 = Date.now();
    while (!this.gotGreeting) {
      await new Promise((r) => setTimeout(r, 40));
      if (Date.now() - t0 > 30_000)
        throw new Error("VA greeting timeout – no prompt received");
    }
    await this.greetingFinished;

    /* close greeting stream */
    this.callStartRpc.closeStream();
    this.callStartRpc.close();
    this.callStartRpc = null;

    /* enter duplex mode */
    this.state = CallState.AUDIO_STREAMING;
    await this.flushMicBuf();        
    await this.startAudioStreaming();
  }

  /** =======================================================================
   * endCall
   * ========================================================================*/
  public async endCall() {
    if (this.state !== CallState.AUDIO_STREAMING) return this.getRecordings();

    this.state = CallState.CALL_END;
    this.recordCallEnd();

    this.tts.stopAll();
    await this.flushMicBuf();

    if (this.audioRpc) {
      await this.audioRpc.closeStream();
      this.audioRpc.close();
      this.audioRpc = null;
    }

    this.callEndRpc = await this.openGrpcStream("callEnd", { eventType: 2 });

    await this.callEndRpc.send(
      new StreamingSpeechInferRequest({
        streamSpeechRequest: {
          case: "streamingConfig",
          value: {
            config: {
              encoding: mapAudioEncoding("LINEAR16"),
              sampleRateHertz: 16_000,
            },
          },
        },
      }),
      true
    );

    await this.sendInsightConfig(this.callEndRpc, 2);

    this.callEndRpc.closeStream();
    this.callEndRpc.close();
    this.callEndRpc = null;

    const rec = await this.getRecordings();
    try {
      const { putWav } = await import("@/lib/audio/recStore");
      if (rec.caller) await putWav(`${rec.convId}-caller`, rec.caller);
      if (rec.agent) await putWav(`${rec.convId}-agent`, rec.agent);
      if (rec.mixed) await putWav(`${rec.convId}-mixed`, rec.mixed);
    } catch {
      /* ignore */
    }

    await this.closeAll();
    return rec;
  }

  /** ====================================================================
   * handleServer – dispatches ASR / VA
   * ===================================================================== */
  private handleServer = (msg: ServerMessage) => {
    const stamp = Date.now();
    this.pushToUI({ ...msg, serverTimestamp: stamp } as any);

    if (isErrorMessage(msg)) {
      this.tts.stopAll();
      this.state = CallState.ENDED;
      this.recordCallEnd(stamp);
      this.closeAll();
      return;
    }

    const rec = msg.inferInsightResponse?.recognitionResult;
    if (rec) this.handleAsr(rec, stamp);

    const va = msg.inferInsightResponse?.virtualAgentResult;
    if (va) this.handleVa(va);
  };

  /** handleAsr – metrics, barge-in, etc. */
  private handleAsr(rec: any, stamp: number) {
    if (!this.curDlg) this.startNewDialogue();
    const d = this.curDlg!;

    if (rec.responseEvent === OutputEvent.EVENT_START_OF_INPUT) {
      d.startOfInput ??= stamp;
      if (d.bargeinable) {
        d.bargeInStart = stamp;
        this.tts.stopAll();
        void this.flushMicBuf();
      }
    }

    if (d.bargeInStart && !this.tts.isPlaying) {
      d.bargeInLatency = (Date.now() - d.bargeInStart) / 1000;
      d.bargeInStart = undefined;
    }

    if (!rec.isFinal && rec.alternatives?.length && !d.firstInterimReceived)
      d.firstInterimReceived = stamp;

    if (rec.isFinal && rec.resultEndTime) {
      d.finalRecognitionReceived = stamp;
      if (d.firstInterimReceived)
        d.interimPlayoutLength =
          (d.finalRecognitionReceived - d.firstInterimReceived) / 1000;
    }

    if (rec.responseEvent === OutputEvent.EVENT_END_OF_INPUT) {
      d.endOfInput = stamp;
      if (d.startOfInput)
        d.customerUtteranceLength = (d.endOfInput - d.startOfInput) / 1000;
      void this.finalizeUserTurn();
    }
  }

  /** ======================================================================
   * handleVa
   * =======================================================================*/
  private async handleVa(va: VirtualAgentResult) {
    this.gotGreeting = true;
    this.awaitingVaAfterEoi = false;

    if (this.state === CallState.AUDIO_STREAMING && !this.audioRpc)
      await this.startAudioStreaming();

    const rt = va.responseType as number | undefined;
    const isChunk = rt === VirtualAgentResult_ResponseType.RESPONSE_CHUNK;
    const bargeable = va.prompts.some((p) => p.bargein);

    /* ─────────── Greeting (first packet) ─────────── */
    if (!this.initialPromptsPlayed) {
      await this.playPrompts(va.prompts, true);
      this.initialPromptsPlayed = true;
      this.finishGreeting();
      await this.startAudioStreaming();
      return;
    }

    /* ─────────── General prompt handling ─────────── */
    const finished = !isChunk || va.prompts.some((p) => p.final);
    if (!this.curDlg) this.startNewDialogue();

    if (bargeable) {
      /* ------------------------------------------------------------------ *
       *  Barge-in-able prompts – enable recording ASAP, even mid-prompt
       * ------------------------------------------------------------------ */
      this.curDlg!.bargeinable = true;                                
      if (!this.audioRpc) await this.startAudioStreaming();            
      await this.playPrompts(va.prompts);
      if (!finished) return;                                            
      await this.startAudioStreaming();
    } else {
      /* ------------------------------------------------------------------ *
       *  Non-barge-in prompts – wait until playback completes
       * ------------------------------------------------------------------ */
      this.curDlg!.bargeinable = false;
      await this.playPrompts(va.prompts);

      const prev = this.latency.dialogues.at(-2);
      const cur  = this.curDlg!;
      if (prev && prev.endOfInput && cur.firstPromptByteReceived)
        prev.silenceGap1 =
          (cur.firstPromptByteReceived - prev.endOfInput) / 1000;

      await this.startAudioStreaming();
      if (cur.endOfInput && finished)
        cur.silenceGap2 = (Date.now() - cur.endOfInput) / 1000;
    }
  }

  /** =========================================================================
   * playPrompts – dedupe & collect metrics
   * =========================================================================*/
  public async playPrompts(prompts: Prompt[], _isGreeting = false) {
    for (const p of prompts) {
      const key = (p.text ?? "").trim().toLowerCase() || `${Date.now()}`;
      if (this.playedPromptKeys.has(key)) continue;
      this.playedPromptKeys.add(key);

      if (p.audioContent?.length) {
        const t0    = Date.now();
        const bytes = p.audioContent.length;
        await this.tts.playWavBytes(p.audioContent);

        if (this.curDlg) {
          this.curDlg.totalPromptPlaybackTime += (Date.now() - t0) / 1000;
          this.curDlg.promptBytes = (this.curDlg.promptBytes ?? 0) + bytes;
        }
        if (!this.initialPromptsPlayed) {
          this.latency.greetingPromptBytes  =
            (this.latency.greetingPromptBytes ?? 0) + bytes;
          this.latency.greetingPlaybackTime =
            (this.latency.greetingPlaybackTime ?? 0) + (Date.now() - t0) / 1000;
        }
      }

      /* echo text to UI */
      if (p.text) {
        const echo: any = {
          messageId: `echo-${Date.now()}`,
          status: 0,
          inferInsightResponse: new InferInsightResponse({
            virtualAgentResult: new VirtualAgentResult({ prompts: [p] }),
          }),
        };
        this.pushToUI({ ...echo, serverTimestamp: Date.now() });
      }
    }
  }

  /** sendAudioChunk – buffer & stream mic audio */
  public async sendAudioChunk(chunk: Uint8Array) {
    if (this.state !== CallState.AUDIO_STREAMING || this.awaitingVaAfterEoi)
      return;
    if (this.tts.isPlaying && !this.curDlg!.bargeinable) return;

    await this.ensureAudioRpc();

    this.micBuf.push(chunk);
    this.callerPcm.push({ ts: Date.now(), data: chunk });

    if (!this.bufTimer)
      this.bufTimer = window.setTimeout(() => this.flushMicBuf(), 40);
  }

  /** flushMicBuf – consolidate buffered chunks */
  private async flushMicBuf() {
    this.bufTimer = null;
    if (!this.audioRpc || this.state !== CallState.AUDIO_STREAMING) {
      this.micBuf.length = 0;
      return;
    }
    if (!this.micBuf.length) return;

    const merged = new Uint8Array(
      this.micBuf.reduce((n, b) => n + b.length, 0)
    );
    let off = 0;
    for (const b of this.micBuf) merged.set(b, off), (off += b.length);
    this.micBuf.length = 0;

    await this.audioRpc.send(
      new StreamingSpeechInferRequest({
        messageId: `mic-${Date.now()}`,
        streamSpeechRequest: { case: "audioContent", value: merged },
      })
    );
    this.curDlg!.audioChunksSent++;
  }

  /** ensureAudioRpc – (re)open duplex stream if needed */
  private async ensureAudioRpc() {
    if (!this.audioRpc) await this.startAudioStreaming();
  }

  /** startAudioStreaming – open new duplex stream */
  private async startAudioStreaming() {
    if (this.state !== CallState.AUDIO_STREAMING || this.audioRpc) return;

    this.audioRpc = await this.openGrpcStream("complete", { interimResults: true });  

    await this.audioRpc.send(
      new StreamingSpeechInferRequest({
        streamSpeechRequest: {
          case: "streamingConfig",
          value: {
            config: {
              encoding: mapAudioEncoding("LINEAR16"),
              sampleRateHertz: 16_000,
              languageCode: this.config.language,
            },
            interimResults: true,
          },
        },
      }),
      true
    );

    await this.sendInsightConfig(this.audioRpc);
    this.startNewDialogue();
  }

  /** finalizeUserTurn – close stream, await VA */
  private async finalizeUserTurn() {
    this.awaitingVaAfterEoi = true;
    const rpc = this.audioRpc;
    this.audioRpc = null;
    await rpc?.closeStream();
  }

  /* ====================== misc helpers ====================== */
  private recordCallEnd(ts = Date.now()) {
    this.callEndTime ??= ts;
    this.latency.callEnd ??= ts;
  }


private async openGrpcStream(
  closeMode: "complete" | "callEnd",
  {
    interimResults = false,
    eventType,
  }: { interimResults?: boolean; eventType?: 1 | 2 } = {}
) {
  const rpc = bridgingClient.startCall(this.handleServer, this.config, {
    closeMode,
  });

  /* streamingConfig */
  await rpc.send(
    new StreamingSpeechInferRequest({
      streamSpeechRequest: {
        case: "streamingConfig",
        value: {
          config: {
            encoding: mapAudioEncoding("LINEAR16"),
            sampleRateHertz: 16_000,
            languageCode: this.config.language,
          },
          interimResults,
        },
      },
    }),
    true
  );

  /*  streamingInsightConfig (must never be empty) */
  await rpc.send(
    new StreamingSpeechInferRequest({
      streamSpeechRequest: {
        case: "streamingInsightConfig",
        value: {
          clientId:        "chatbot-ui",
          orgId:           this.config.orgId,
          conversationId:  this.config.conversationId,
          ccaiConfigId:    "NATIVE_ADVANCED_VIRTUAL_AGENT",
          virtualAgentId:  this.config.virtualAgentId,
          role:            1,
          requestType:     1,
          consumerInfo: {
            wxccClusterId: this.config.wxccClusterId,
            userAgent:     this.config.userAgent,
          },
        },
      },
      ...(eventType ? { inputEvent: { eventType } } : {}),
      outputAudioConfig: {
        audioEncoding:   OutputAudioEncoding.OUTPUT_MULAW,
        sampleRateHertz: 8000,
        voice: { languageCode: "en-US" },
      },
    }),
    true
  );

  return rpc;
}


  private async sendInsightConfig(rpc: StreamingCall, eventType?: 1 | 2) {
    await rpc.send(
      new StreamingSpeechInferRequest({
        streamSpeechRequest: {
          case: "streamingInsightConfig",
          value: {
            clientId: "chatbot-ui",
            orgId: this.config.orgId,
            conversationId: this.config.conversationId,
            ccaiConfigId: "NATIVE_ADVANCED_VIRTUAL_AGENT",
            virtualAgentId: this.config.virtualAgentId,
            role: 1,
            requestType: 1,
            consumerInfo: {
              wxccClusterId: this.config.wxccClusterId,
              userAgent: this.config.userAgent,
            },
          },
        },
        ...(eventType ? { inputEvent: { eventType } } : {}),
        outputAudioConfig: {
          audioEncoding: OutputAudioEncoding.OUTPUT_MULAW,
          sampleRateHertz: 8000,
          voice: { languageCode: "en-US" },
        },
      }),
      true
    );
  }

  /** startNewDialogue – push empty metrics skeleton */
  private startNewDialogue() {
    this.curDlg = {
      dialogueNumber: ++this.dlgNum,
      audioChunksSent: 0,
      bargeinable: false,
      totalPromptPlaybackTime: 0,
    };
    this.latency.dialogues.push(this.curDlg);
  }

  /** closeAll – tidy-up */
  public async closeAll() {
    try {
      this.callStartRpc?.close();
      this.audioRpc?.close();
      this.callEndRpc?.close();
      this.tts.stopAll();
      await this.tts.close();
    } finally {
      this.recordCallEnd();
      this.state = CallState.ENDED;
      this.callerPcm.length = 0;
      this.agentPcm.length = 0;
    }
  }
}
