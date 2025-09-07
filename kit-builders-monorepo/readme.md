# Executive Summary — Kit Builders (Prototype / POC)

This document summarizes an **exploratory prototype** – a narrow, happy‑path sketch of a creator publishing experience. It is **NOT** a production system, product roadmap commitment, nor a hardened reference implementation. All functionality is partial, demo‑centric, and subject to removal or breakage.

## Intent (Illustrative Only)
Explore how a unified stack (Next.js UI + Rails API + background jobs) might support a funnel of **onboarding → activation → conversion** across: landing pages, basic email drafting, subscription (double opt‑in), lightweight experiments, and rudimentary analytics signals.

## Included (Prototype Surface)
- **Editors (partial)**: TipTap‑based draft experience for broadcast email & landing page blocks; test send stub; React Email preview skeleton.
- **Landing Pages (simplified)**: Block list (Hero / CTA / Subscribe / Thank You / Features) with server render; basic image transform route.
- **Subscribe Flow (happy path)**: Form → confirmation token → confirm → welcome worker (minimal rate limiting; no robust error handling).
- **Experiments (stub)**: Variant allocation & simple SRM check; NO production experimentation rigor (no sequential boundaries, MDE planning, guardrails beyond SRM/χ² demo).
- **RUM (rudimentary)**: Captures a few metrics (LCP, TTFB) & device breakdown; no long task / INP / sampling strategy maturity.
- **Feature Flags & Overrides (basic)**: In‑app toggles & per‑org overrides; no audit trail, targeting rules, or governance.
- **Image Handling (basic)**: Opportunistic sharp transforms via a Next route; no CDN layer or caching optimization strategy.
- **Data Events Table (partial)**: JSON blobs for a handful of interaction types; no warehouse sync or retention policy.

## Explicit Non‑Goals / Missing (Selected)
| Area | NOT Provided / Incomplete |
|------|---------------------------|
| Security | Signature verification (webhooks), authZ roles, tenant isolation hardening |
| Deliverability | Bounce classification, feedback loops, seed list monitoring, inbox placement |
| Billing | Real Stripe lifecycle (invoices, proration, entitlements) |
| Experiments | Sequential testing, bandits, guardrail enforcement, power analysis |
| Analytics | Warehouse / transformation layer, retention cohorts, segmentation engine |
| Reliability | HA topology, backpressure strategies, disaster recovery, SLO instrumentation |
| Privacy | GDPR/DSAR workflows, encryption at rest for PII, consent versioning |
| Performance | Systematic profiling, INP/CLS tracking, queue saturation alerts |
| Access Control | Roles/permissions matrix, fine‑grained feature entitlements |
| QA | Broad automated test coverage; only light smoke / a few E2E specs |

## Representative Journeys (Demo Only)
1. Draft landing page from template → publish → subscribe test contact → confirm → see basic metrics.
2. Create email draft → (optionally) assign simple experiment variant → inspect placeholder analytics.
3. Toggle a feature flag / override to demonstrate gating mechanics (no enforcement sophistication).

## Architecture Snapshot (Conceptual)
| Layer | Prototype Choice | Note |
|-------|------------------|------|
| Web | Next.js App Router | Mixed SSR/CSR; minimal SWR fetch patterns |
| API | Rails 7.2 | Straightforward CRUD + workers (Sidekiq) |
| Persistence | Postgres (+ Redis for jobs) | No sharding / partitioning strategy |
| Background | Sidekiq queues (default, mailers) | Only a few illustrative workers |
| State (client) | Local state + small Zustand stores | Avoids complex global caches |
| UI | Tailwind + shadcn/ui + Radix primitives | Accessibility not audited |
| Events | Single `events` table (JSONB) | No schema evolution/versioning strategy |

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
