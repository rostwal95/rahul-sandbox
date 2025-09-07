# Kit Builders — Prototype / POC

An **exploratory prototype**: a narrow, happy-path sketch of a creator publishing experience. It is **NOT** a production system, product roadmap, or hardened reference implementation. All functionality is partial, demo-centric, and subject to change.

## Intent 
Explore how a unified stack (Next.js UI + Rails API + background jobs) can support a funnel of **onboarding → activation → conversion** across landing pages, basic email drafting, subscription (double opt-in), lightweight experiments, and rudimentary analytics.

## Included (prototype surface)
- **Editors (partial):** TipTap-based drafting for broadcast email & landing page blocks; test-send stub; React Email preview skeleton.
- **Landing Pages (simplified):** Block list (Hero / CTA / Subscribe / Thank You / Features) with server render; basic image transform route.
- **Subscribe flow (happy path):** Form → confirmation token → confirm → welcome worker (minimal rate limiting; limited error handling).
- **Experiments (stub):** Variant allocation & simple SRM check; no sequential boundaries, MDE planning, or full guardrails.
- **RUM (rudimentary):** LCP/TTFB & device breakdown; no long task / INP / mature sampling strategy.
- **Feature flags & overrides (basic):** In-app toggles & per-org overrides; no audit trail or governance.
- **Image handling (basic):** Sharp transforms via a Next route; no CDN/caching strategy.
- **Data events table (partial):** JSON blobs for a few interaction types; no warehouse sync or retention policy.

## Explicit non-goals / missing (selected)
| Area          | NOT provided / Incomplete |
|---------------|---------------------------|
| Security      | Webhook signatures, authZ roles, tenant isolation hardening |
| Deliverability| Bounce taxonomy, FBLs, seed lists, inbox placement |
| Billing       | Real Stripe lifecycle (invoices, proration, entitlements) |
| Experiments   | Sequential tests, bandits, guardrail policy, power analysis |
| Analytics     | Warehouse/modeling, retention cohorts, segmentation engine |
| Reliability   | HA topology, backpressure, DR, SLO instrumentation |
| Privacy       | GDPR/DSAR, at-rest PII encryption, consent versioning |
| Performance   | Systematic profiling, INP/CLS tracking, queue saturation alerts |
| Access Control| Roles/permissions matrix, fine-grained entitlements |
| QA            | Broad automated tests (only light smoke/E2E) |

## Representative journeys (demo only)
1. Draft LP from template → publish → subscribe test contact → confirm → view basic metrics.
2. Create email draft → (optional) assign simple experiment variant → inspect placeholder analytics.
3. Toggle a feature flag/override to demonstrate gating mechanics (no sophisticated enforcement).

## Architecture snapshot (conceptual)
| Layer        | Prototype choice         | Note                                      |
|-------------|---------------------------|-------------------------------------------|
| Web         | Next.js App Router        | Mixed SSR/CSR; minimal SWR fetch patterns |
| API         | Rails 7.2                 | CRUD + workers (Sidekiq)                  |
| Persistence | Postgres (+ Redis jobs)   | No sharding/partitioning strategy         |
| Background  | Sidekiq queues            | A few illustrative workers                |
| State (web) | Local + small Zustand     | Avoids complex global caches              |
| UI          | Tailwind + shadcn/ui + Radix| Accessibility not audited               |
| Events      | Single `events` (JSONB)   | No schema versioning strategy             |

## Current features (high-level, unstable)
- LP & broadcast draft editors (minimal formatting set).
- Double opt-in + welcome worker path (happy path; sparse error handling).
- Simple experiment allocation + SRM signaling; no lifecycle management.
- RUM capture + basic display; no sampling governance.
- Feature flag & override toggles with naive evaluation.
- Image transform endpoint (resize + basic focal logic).

## Caveats & risks
- Limited tests → regressions likely.
- Error handling, retries, idempotency & data integrity are shallow.
- Security posture is intentionally thin — **do not** expose externally without hardening.
- Any “pattern” shown omits operational depth required for real scale.

## Possible future work
- Warehouse sink + modeling (ClickHouse/BigQuery/dbt) for retention & engagement.
- Real Stripe subscription flows + entitlements matrix.
- Expanded experimentation (bandits, sequential control, guardrails).
- Robust segmentation & audience import with preview counts.
- Deliverability pipeline (bounce taxonomy, spam-trap heuristics, domain reputation).
- Privacy/compliance workflows (DSAR, consent revisions, encryption strategy).
- Performance/observability: INP/CLS/long tasks; queue saturation & alerts.

## Summary
This repository is a **learning scaffold**: it favors speed of exploration and architectural visibility over completeness and rigor. Re-implement, redesign, or discard freely; do **not** extend directly into production without substantial rework.
