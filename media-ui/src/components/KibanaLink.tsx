/* ===============================================================
   Renders an “Open filtered logs in Kibana” link
   =============================================================== */

import React from "react";
import { Config } from "./ConfigScreen";

/* ---------- constants -------------------------------------------------- */
const INDEX_ID        = "5cfc3390-a9f3-11e4-9c42-b93379b43d67"; 
const INNER_INDEX_ID  = "5cfc3390-a9f3-11e9-9c42-b93379b43d67"; 


/** =====================================================================
  * Maps cluster identifiers (e.g. "qa-us1", "intg-us1") to the
  * corresponding base Kibana Discover URLs.
  ======================================================================= */

const clusterMap: Record<string, string> = {
  /* QA */
  "qa-us1"  : "https://kibana-log.qaus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "qaus1"   : "https://kibana-log.qaus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",

  /* INTG */
  "intg-us1": "https://kibana-log.intgus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "intgus1" : "https://kibana-log.intgus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",

  /* PROD-US */
  "prod-us1": "https://kibana-log.produs1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "produs1" : "https://kibana-log.produs1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "load-us1": "https://kibana-log.loadus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "loadus1" : "https://kibana-log.loadus1.ciscoccservice.com/_dashboards/app/data-explorer/discover",

  /* PROD-EU */
  "prod-eu1": "https://kibana-log.prodeu1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodeu1" : "https://kibana-log.prodeu1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prod-eu2": "https://kibana-log.prodeu2.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodeu2" : "https://kibana-log.prodeu2.ciscoccservice.com/_dashboards/app/data-explorer/discover",

  /* PROD-APAC */
  "prod-sg1": "https://kibana-log.prodsg1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodsg1" : "https://kibana-log.prodsg1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prod-anz1": "https://kibana-log.prodanz1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodanz1" : "https://kibana-log.prodanz1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prod-ca1": "https://kibana-log.prodca1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodca1" : "https://kibana-log.prodca1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prod-jp1": "https://kibana-log.prodjp1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
  "prodjp1" : "https://kibana-log.prodjp1.ciscoccservice.com/_dashboards/app/data-explorer/discover",
};


/** ====================================================================
  * Strips the scheme from the orchestrator host, extracts the cluster
  * identifier (with any dashes), then looks up both the dashed and
  * dash-less version.
  ======================================================================= */

function kibanaBaseUrl(host = ""): string | null {
  const m = host
    .replace(/^https?:\/\//, "")
    .match(/(?:^|-)insight-orchestrator\.([^.]+)\./);
  if (!m) return null;

  const key = m[1];                  // intg-us1
  const nodash = key.replace(/-/g, ""); // intgus1
  return clusterMap[key] ?? clusterMap[nodash] ?? null;
}

const CONTAINERS = [
  "insight-orchestrator",
  "stt-connector",
  "tts-connector",
  "activity-service",
];


/** ====================================================================
  * Minimal Rison encoder for primitives, arrays, and plain objects.
  * (Only what we need for these URLs.)
  ======================================================================= */

function rison(v: unknown): string {
  if (v === null)  return "!n";
  if (v === false) return "!f";
  if (v === true)  return "!t";
  if (typeof v === "number")  return String(v);
  if (typeof v === "string")  return `'${v.replace(/'/g, "''")}'`;
  if (Array.isArray(v))       return `!(${v.map(rison).join(",")})`;

  const encodeKey = (k: string) =>
    /^[A-Za-z0-9_]+$/.test(k) ? k : `'${k.replace(/'/g, "''")}'`;

  return `(${Object.entries(v as Record<string, unknown>)
           .map(([k, val]) => `${encodeKey(k)}:${rison(val)}`)
           .join(",")})`;
}


/** ==========================================================================
  * Constructs a Kibana Discover URL for the given conversation.
  *
  *   – `_a` and `_g` are identical to the original implementation.
  *   – `_q` is updated with dynamic container list.
  *   – An anchor (#…) is added so “Data Explorer” opens with the same
  *     filters when the user switches from the Discover UI.
  =============================================================================*/

function buildDiscoverUrl(base: string, convoId: string): string {
  /* ------------------------ outer _a ---------------------------------------- */
  const _a = rison({
    discover: {
      columns: ["message", "conversation_id", "kubernetes.container_name"],
      isDirty: false,
      sort: [],
    },
    metadata: { indexPattern: INDEX_ID, view: "discover" },
  });

  /* ------------------------- _g – global state ------------------------------- */
  const _g = rison({
    time: { from: "now-45m", to: "now" },
    filters: [],
    refreshInterval: { pause: true, value: 0 },
  });
  

  /* --------------------------- _q – filters ----------------------------------- */

  const matchExpr = `(bool:(minimum_should_match:1,should:!(${CONTAINERS.map(
    (c) => `(match_phrase:(kubernetes.container_name:${c}))`
  ).join(",")})))`;

  const _q = rison({
    filters: [
      {
        $state: { store: "appState" },
        meta: {
          alias: null,
          disabled: false,
          index: INDEX_ID,
          key: "kubernetes.container_name",
          negate: false,
          params: { type: "phrases", value: CONTAINERS.join(", ") },
          type: "phrases",
        },
        query: matchExpr,
      },
      {
        $state: { store: "appState" },
        meta: {
          alias: null,
          disabled: false,
          index: INDEX_ID,
          key: "conversation_id",
          negate: false,
          params: { query: convoId },
          type: "phrase",
        },
        query: `(match_phrase:(conversation_id:${convoId}))`,
      },
    ],
    query: { language: "kuery", query: "" },
  });

  /* hash – same filters for the “Data Explorer” inner-app navigation -------- */

  const hash = encodeURIComponent(
    `?_a=(discover:(columns:!(message,kubernetes.container_name),isDirty:!f,sort:!()),` +
      `metadata:(indexPattern:'${INNER_INDEX_ID}',view:discover))` +
    `&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1h,to:now))` +
    `&_q=(filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'${INNER_INDEX_ID}',` +
      `key:kubernetes.container_name,negate:!f,params:!(${CONTAINERS.join(",")}),type:phrases,` +
      `value:'${CONTAINERS.join(", ")}'),query:${matchExpr})),` +
      `query:(language:kuery,query:'${convoId}'))`
  );

  return `${base}?_a=${_a}&_g=${_g}&_q=${_q}#${hash}`;
}

/** ========================================================================
  * @prop cfg       – application configuration (includes host & convoId)
  * @prop className – optional CSS classes for the link element
  =========================================================================*/

interface Props {
  cfg: Config;
  className?: string;
}

/** ===========================================================================
  * Renders an anchor that opens the pre-filtered Kibana Discover view.
  * Returns null when the host / conversationId is unavailable.
  ============================================================================*/

const KibanaLink: React.FC<Props> = ({
  cfg,
  className = "flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm",
}) => {
  const base = kibanaBaseUrl(cfg.host);
  if (!base || !cfg.conversationId) return null;

  const url = buildDiscoverUrl(base, cfg.conversationId.trim());

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title="Open filtered logs in Kibana"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path d="M3 20h18L12 4 3 20z" />
      </svg>
      Kibana&nbsp;Logs
    </a>
  );
};

export default KibanaLink;
