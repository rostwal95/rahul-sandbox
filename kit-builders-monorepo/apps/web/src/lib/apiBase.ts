// Central API base resolver
// Browser: use NEXT_PUBLIC_API_URL (mapped port)
// Server (container): if hostname is localhost, switch to INTERNAL_API_HOST or service name 'api'
export function apiBase() {
  // Publicly configured base (browser) remains authoritative
  const pub = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const stableOverride = process.env.NEXT_PUBLIC_API_RENDER_BASE; // optional explicit stable value for SSR/ISR
  if (typeof window !== "undefined") return pub.replace(/\/$/, "");

  // If a stable render base is supplied, always use it to keep server/client markup identical (prevents hydration mismatch)
  if (stableOverride) return stableOverride.replace(/\/$/, "");

  const internal = process.env.INTERNAL_API_HOST; // e.g. api:4000
  // Heuristic: only map to internal host if we detect we're inside a containerized env (presence of DOCKER or running as non-mac user)
  const inContainer = !!process.env.DOCKER || process.env.CONTAINER === "true";
  if (!inContainer) {
    // Use the public base unchanged so SSR markup equals what client computes
    return pub.replace(/\/$/, "");
  }
  try {
    const u = new URL(pub);
    if (internal && ["localhost", "127.0.0.1"].includes(u.hostname)) {
      const resolved = `http://${internal.replace(/^http:\/\//, "")}`.replace(
        /\/$/,
        "",
      );
      return resolved;
    }
    if (["localhost", "127.0.0.1"].includes(u.hostname)) u.hostname = "api";
    return u.toString().replace(/\/$/, "");
  } catch {
    return pub;
  }
}
