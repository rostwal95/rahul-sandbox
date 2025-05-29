/* ===============================================================
             Form for collecting call configuration
   =============================================================== */

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

/** ====================================================================
 * Defines all configuration parameters required to start a call:
 *  • host            – orchestrator URL
 *  • token           – bearer token for auth
 *  • language        – speech recognition & TTS language
 *  • orgId           – organization UUID
 *  • conversationId  – conversation UUID
 *  • virtualAgentId  – agent UUID
 *  • ttsVoice, ttsGender – optional TTS settings
 *  • wxccClusterId   – cluster identifier for routing
 *  • userAgent       – client identifier string
 *  • microphoneId    – optional specific mic device
 *  • joinWithMicMuted– optional flag to start muted
 ======================================================================= */
export interface Config {
  host: string;
  token: string;
  language: string;
  orgId: string;
  conversationId: string;
  virtualAgentId: string;
  ttsVoice?: string;
  ttsGender?: "MALE" | "FEMALE";
  wxccClusterId: string;
  userAgent: string;
  microphoneId?: string;
  joinWithMicMuted?: boolean;
}

/** ========================================================================
 * @prop onSubmit – callback invoked with validated Config on form submit
 =========================================================================*/
interface ConfigScreenProps {
  onSubmit: (cfg: Config) => void;
}

/** ======================================================================
 * isValidUUID
 *
 * Validates whether a string conforms to UUID v4 format.
 * ======================================================================*/
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/** ========================================================================
 * Renders a configuration form and persists last values to localStorage.
 * Validates required fields and UUID formats before invoking onSubmit.
 ===========================================================================*/
const ConfigScreen: React.FC<ConfigScreenProps> = ({ onSubmit }) => {
  const [host, setHost] = useState("");
  const [token, setToken] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [orgId, setOrgId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [virtualAgentId, setVirtualAgentId] = useState("");
  const [ttsVoice, setTtsVoice] = useState("");
  const [ttsGender, setTtsGender] = useState<"MALE" | "FEMALE" | undefined>(undefined);
  const [wxccClusterId, setWxccClusterId] = useState("intgus1");
  const [userAgent, setUserAgent] = useState("web-ui");

  const [microphoneId, setMicrophoneId] = useState("default");
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------
   * Enumerate microphones once the component is mounted in the browser
   * -------------------------------------------------------------------*/
  useEffect(() => {
    if (typeof navigator === "undefined") return; // guard for SSR

    navigator.mediaDevices
      .enumerateDevices()
      .then((devs) => {
        const audioInputs = devs.filter((d) => d.kind === "audioinput");
        setMicrophones(audioInputs);
        if (audioInputs.length) setMicrophoneId(audioInputs[0].deviceId);
      })
      .catch(() => {
        setMicrophones([]);
      });
  }, []);

  /* ---------------------------------------------------------------------
   * Load last-used configuration from localStorage if available
   * -------------------------------------------------------------------*/
  useEffect(() => {
    if (typeof window === "undefined") return; // guard for SSR

    const saved = localStorage.getItem("lastConfig");
    if (!saved) {
      setHost("https://ferrari-intg-insight-orchestrator.intg-us1.rtmslab.net");
      return;
    }
    try {
      const cfg: Config = JSON.parse(saved);
      setHost(cfg.host);
      setToken(cfg.token);
      setLanguage(cfg.language);
      setOrgId(cfg.orgId);
      setConversationId(cfg.conversationId);
      setVirtualAgentId(cfg.virtualAgentId);
      setTtsVoice(cfg.ttsVoice || "");
      setTtsGender(cfg.ttsGender);
      setWxccClusterId(cfg.wxccClusterId);
      setUserAgent(cfg.userAgent);
      setMicrophoneId(cfg.microphoneId || "default");
    } catch {
      /* ignore corrupted localStorage entry */
    }
  }, []);

  /* ---------------------------------------------------------------------
   * Handle submit – validate, persist, then bubble up to parent
   * -------------------------------------------------------------------*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) return setError("Host is required");
    if (!token.trim()) return setError("Bearer token is required");
    if (!orgId.trim()) return setError("OrgId is required");
    if (!isValidUUID(orgId)) return setError("OrgId must be a valid UUID");
    if (!conversationId.trim()) return setError("ConversationId is required");
    if (!isValidUUID(conversationId))
      return setError("ConversationId must be a valid UUID");
    if (!wxccClusterId.trim()) return setError("ClusterId is required");
    if (!userAgent.trim()) return setError("UserAgent is required");

    const cfg: Config = {
      host: host.trim(),
      token: token.trim(),
      language,
      orgId: orgId.trim(),
      conversationId: conversationId.trim(),
      virtualAgentId: virtualAgentId.trim(),
      ttsVoice: ttsVoice.trim() || undefined,
      ttsGender,
      wxccClusterId: wxccClusterId.trim(),
      userAgent: userAgent.trim(),
      microphoneId,
      joinWithMicMuted: false,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("lastConfig", JSON.stringify(cfg));
    }

    setError("");
    onSubmit(cfg);
  };

  /* ---------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------*/
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 text-center">
        Configuration
      </h1>
      <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m-2-2c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m8-10h-4m-2 0H8m8 4h-4m-2 0H8m4 4h4m-4 0H8"
          ></path>
        </svg>
        Works best in a quiet environment with a good internet.
      </p>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Microphone
          </label>
          <select
            value={microphoneId}
            onChange={(e) => setMicrophoneId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          >
            {microphones.length ? (
              microphones.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || `Microphone ${m.deviceId}`}
                </option>
              ))
            ) : (
              <option value="default">Default</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Host (Orchestrator)
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bearer Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOi..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="en-US">English (US)</option>
            <option value="en-IN">English (IN)</option>
            <option value="fr-FR">French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OrgId (UUID)
          </label>
          <input
            type="text"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ConversationId (UUID)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
            />
            <button
              type="button"
              onClick={() => setConversationId(uuidv4())}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VirtualAgentId
          </label>
          <input
            type="text"
            value={virtualAgentId}
            onChange={(e) => setVirtualAgentId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WxCC ClusterId
            </label>
            <input
              type="text"
              value={wxccClusterId}
              onChange={(e) => setWxccClusterId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Agent
            </label>
            <input
              type="text"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-lg mt-6"
        >
          Start
        </button>
      </form>
    </div>
  );
};

export default ConfigScreen;
