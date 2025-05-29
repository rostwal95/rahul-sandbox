import {
  createGrpcTransport,
  type GrpcTransportOptions,
} from "@connectrpc/connect-node";

/** ===============================================================================
 * Creates and configures a gRPC‐over‐HTTP2 transport for Insight-Orchestrator.
 *
 * • Uses HTTP/2, sets a large initial window size for performance.
 * • Sends keep‐alive pings every 10 s, with a 5 s ping timeout.
 * • Applies a default 30 s deadline to all calls.
 * • Injects the Bearer token into the Authorization header.
 *
 * @param baseUrl – The full orchestrator URL (e.g. https://host:port)
 * @param token   – Bearer token for Authorization
 * @returns A configured Connect transport instance.
 * ===============================================================================*/

export function makeInsightTransport(baseUrl: string, token: string) {
  const url       = new URL(baseUrl);
  const authority = url.host;

  const opts: GrpcTransportOptions = {
    httpVersion: "2",
    baseUrl,
    nodeOptions: {
      servername: authority,
      settings: { initialWindowSize: 4 * 1024 * 1024 },
    },
    pingIntervalMs:          10_000,
    pingIdleConnection:      true,
    pingTimeoutMs:           5_000,
    idleConnectionTimeoutMs: 0,
    interceptors: [
      (next) => async (req) => {
        req.header.set("authorization", `Bearer ${token}`);
        if (!req.header.has("grpc-timeout")) {
          req.header.set("grpc-timeout", "30000000u");
        }
        return next(req);
      },
    ],
  };

  return createGrpcTransport(opts);
}
