# Kit Builders — Prototype / POC

This is a minimal, demo-focused prototype for a creator publishing experience. It is not production-ready and is intended for exploration and learning only.

## Demo Video

[![Demo Video](docs/recording/demo.mp4)](docs/recording/demo.mp4)

## Quick Start

1. Install dependencies: `pnpm install` (or `npm install`)
2. Start the backend (Rails):
   ```sh
   cd apps/api && ./bin/dev
   ```
3. Start the frontend (Next.js):
   ```sh
   cd apps/web && npm run dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000) (frontend) and [http://localhost:4000](http://localhost:4000) (backend)

## More Details

> ℹ️ For a deep dive into architecture, features, and design rationale, check out the full [design_doc.md](./design_doc.md).

## Tech Stack (at a glance)

| Layer       | Choice                        | Notes                          |
| ----------- | ----------------------------- | ------------------------------ |
| API         | Rails 7.2                     | CRUD + Sidekiq workers         |
| Persistence | Postgres, Redis (jobs)        | No sharding/partitioning       |
| Background  | Sidekiq queues                | Only a few demo workers        |
| State (UI)  | Zustand, local state          | No complex global cache        |
| UI          | Tailwind, shadcn/ui, Radix    | Accessibility not audited      |
| Events      | Single `events` table (JSONB) | No schema evolution/versioning |

## Current Prototype Highlights

- Landing page & broadcast draft editors (minimal formatting set).
- Double opt‑in + welcome worker path (happy path only; error handling sparse).
- Basic experiment allocation + SRM signaling; no lifecycle management.
- RUM metrics capture + simple display; no sampling governance.
- Feature flag & override toggles with naive evaluation.
- Image transform endpoint (resizing / basic focal logic).

## Caveats & Risks (Re‑stating)

- Lack of systematic tests → hidden regressions likely.
- Error handling, retries, idempotency & data integrity are shallow.
- Security posture is intentionally thin (DO NOT expose externally without hardening).
- Any architectural “pattern” shown omits the operational depth needed for real scale.

## Hypothetical / Illustrative Future Work (Not Scheduled)

- Add warehouse sink + modeling (ClickHouse / BigQuery / dbt) for retention & engagement.
- Implement real Stripe subscription flows + entitlements matrix.
- Expand experimentation (bandits, sequential control, guardrail policy evaluation).
- Robust segmentation & audience import pipeline with preview counts.
- Deliverability pipeline (bounce taxonomy, spam trap heuristics, domain reputation).
- Privacy & compliance workflows (DSAR, consent revisions, encryption strategy review).

## Illustrative (Non‑Binding) Outcome Metrics

These are **thought exercises only** – NOT achieved, validated, or guaranteed:

- Time to First Publish (demo path): < 10 mins (assumes templates + zero friction path).
- p50 LP TTFB & LCP: targets listed in README but not measured systematically.
- Webhook success rate / DLQ tolerances: not instrumented; requires future design.

## Summary

Treat this repository purely as a **learning scaffold**: it trades completeness, safety, and rigor for speed of exploration and architectural visibility. Re‑implement, redesign, or discard freely; do **not** extend directly into a production surface without substantial rework.
