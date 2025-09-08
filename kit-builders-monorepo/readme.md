# Kit Builders — Prototype / POC

Minimal, demo-focused prototype for a creator publishing experience. Not production-ready; intended only for exploration & discussion.

## Demo (Video)

<video src="./docs/recording/demo.mp4" width="720" autoplay loop muted playsinline controls poster="./docs/recording/demo-poster.png">
	<source src="./docs/recording/demo.mp4" type="video/mp4" />
	Your browser does not support the video tag. <a href="./docs/recording/demo.mp4">Download the demo video</a>.
</video>

Direct link (fallback): [Open demo video](./docs/recording/demo.mp4).


## Quick Start

```bash
pnpm install          # or npm install
cd apps/api && ./bin/dev &   # Rails API on :4000
cd apps/web && npm run dev   # Next.js on :3000
```

Visit http://localhost:3000 (web) and http://localhost:4000 (API).

## Tech Stack (Snapshot)

| Layer         | Choice                             | Note                             |
| ------------- | ---------------------------------- | -------------------------------- |
| Web UI        | Next.js (App Router), TS, Tailwind | Demo-only pages & editors        |
| API           | Rails 7.2 + Sidekiq                | Basic CRUD + a few workers       |
| Data          | Postgres, Redis (jobs)             | No durability / scaling strategy |
| State         | Local + small Zustand stores       | Minimal caching                  |
| UI Primitives | shadcn/ui, Radix, React Email      | Accessibility not audited        |
| Events        | `events` table (JSONB)             | No schema evolution plan         |

## Highlights (Demo Scope)

- Landing page & broadcast draft editors (minimal formatting)
- Double opt‑in subscribe flow + welcome worker (happy path only)
- Simple experiment variant allocation + SRM signal
- Basic RUM capture (LCP/TTFB) + display
- Feature flags & per-org overrides (naive)
- Image transform endpoint (resize)

## Caveats

- Light/no automated tests; expect regressions
- Sparse error handling, retries, idempotency
- Security hardening absent — do not expose publicly
- Performance, scalability, privacy & compliance concerns unaddressed

## Further Design / Rationale

See the full [design_doc.md](./design_doc.md) for architecture, trade-offs, omissions, and potential future directions.
