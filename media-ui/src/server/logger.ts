/* ===================================================================
   Lightweight, per-connection logger.

   • info / warn / error  – mirror console output, but also keep an
     in-memory copy.
   • setIds()             – lets us tag every line once we learn org /
     conversation IDs.
   • getLines()           – retrieves the scrubbed, joined log text.

   All audio payloads and OAuth tokens are collapsed so that the
   generated log is safe to expose to the UI.
   =================================================================== */

function scrub(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  // redact bearer token
  if (obj.metadata?.token)
    obj.metadata.token = `<redacted:${obj.metadata.token.length}chars>`;

  // collapse audioContent
  if (Object.prototype.hasOwnProperty.call(obj, "audioContent")) {
    const raw = obj.audioContent;
    const bytes =
      typeof raw === "string"
        ? Buffer.from(raw, "base64").length
        : raw instanceof Uint8Array
        ? raw.length
        : 0;
    obj.audioContent = `[bytes=${bytes}]`;
  }

  // collapse streamSpeechRequest.value if it’s audio
  if (obj.streamSpeechRequest?.case === "audioContent") {
    const v = obj.streamSpeechRequest.value;
    const bytes =
      typeof v === "string"
        ? Buffer.from(v, "base64").length
        : v instanceof Uint8Array
        ? v.length
        : 0;
    obj.streamSpeechRequest.value = `[bytes=${bytes}]`;
  }

  for (const k of Object.keys(obj)) scrub(obj[k]);
  return obj;
}

export class Logger {
  private lines: string[] = [];
  private orgId = "unknown";
  private conv = "unknown";

  setIds(org: string, conv: string) {
    this.orgId = org || this.orgId;
    this.conv  = conv || this.conv;
  }

  private stamp() {
    return `[${new Date().toISOString()}] [orgId=${this.orgId}] [conversationId=${this.conv}]`;
  }

  private push(level: "INFO" | "WARN" | "ERR", data: any[]) {
    const txt = data
      .map((d) =>
        typeof d === "string" ? d : JSON.stringify(scrub(d), null, 2)
      )
      .join(" ");
    this.lines.push(`${this.stamp()} ${level}: ${txt}`);

    // mirror to stdout
    const fn = level === "ERR" ? console.error : console.log;
    fn(`${this.stamp()} ${level}:`, ...data);
  }

  info(...d: any[])  { this.push("INFO", d); }
  warn(...d: any[])  { this.push("WARN", d); }
  error(...d: any[]) { this.push("ERR" , d); }

  getLines() { return this.lines.join("\n"); }
}
