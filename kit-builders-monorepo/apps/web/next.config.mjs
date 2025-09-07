import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement for ESM .mjs file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force root to monorepo root (two levels up) so Next doesn't pick an unintended lockfile
  // This silences the multi-lockfile warning and ensures correct file tracing.
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_S3_BUCKET_HOST || "**.s3.amazonaws.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["recharts"],
  },
};

export default nextConfig;
