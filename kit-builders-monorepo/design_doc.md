

# Kit Builders — Prototype / POC Monorepo

A **minimal, incomplete prototype**, sketching a single happy-path funnel **(onboarding → activation → conversion)** across **emails, landing pages, sequences, and lightweight analytics**.

> **Purpose:** illustrate an architectural shape (UI ↔ API data flow, editor composition, background job handoff).
> **Not production:** this is **not** production ready, security hardened, or feature complete. It’s an educational scaffold.

**Illustrative stack:** **Next.js (App Router) + React (TypeScript, Tailwind)** for UI, **Ruby on Rails 7.2** API, **PostgreSQL**, **Redis + Sidekiq**. Small client state via **Zustand**; UI primitives from **shadcn/ui, Radix UI, lucide-react, React Email**.



---

## Table of Contents

* [Disclaimer / Caveats](#disclaimer--caveats)
* [Overview](#overview)
* [Repo Layout](#repo-layout)
* [Illustrative Demo Goals](#illustrative-demo-goals)
* [Current features](#current-features)
* [Functional Requirements](#functional-requirements)
* [Non-Functional Requirements](#non-functional-requirements)
* [Back-of-the-envelope Calculations](#back-of-the-envelope-calculations)
* [Design Patterns & Architecture](#design-patterns--architecture)
* [Architecture Diagrams](#architecture-diagrams)

  * [Flowchart (Mermaid source)](#flowchart-mermaid-source)
  * [Subscribe → Confirm → Welcome (Mermaid source)](#subscribe--confirm--welcome-mermaid-source)
* [API Surface](#api-surface)
* [Data Model](#data-model)
* [Health & Diagnostics](#health--diagnostics)
* [AI Integration Hooks](#ai-integration-hooks)
* [Getting Started](#getting-started)

  * [Prereqs](#prereqs)
  * [Environment Variables](#environment-variables)
  * [Local Dev (no Docker)](#local-dev-no-docker)
  * [Docker Dev](#docker-dev)
  * [E2E (Playwright)](#e2e-playwright)
  * [Makefile Shortcuts](#makefile-shortcuts)
* [Known Gaps](#known-gaps)
* [Future Considerations](#future-considerations)
* [Glossary](#glossary)

---

## Disclaimer / Caveats

* Code is **lightly exercised / untested**; expect bugs & race conditions.
* Security, authZ roles, multi-tenancy, billing accuracy, data retention, PII handling, and deliverability are **not** hardened.
* “Implemented” often means **UI stub** or **partial flow**, not a complete lifecycle.
* Analytics/experiments/segmentation/sequence execution are **simplified**.
* Capacity/KPI numbers are **illustrative only**.

---

## Overview

**Happy-path creator experience:**

* **Onboarding**: guided drawer & templates.
* **Activation**: ready-to-ship flows (broadcasts, sequences, LP builder).
* **Conversion**: LPs with smart-crop hero images, A/B tests, subscribe forms, double opt-in, RUM, simple analytics.

Includes placeholders for: deliverability-adjacent analytics, feature flags/plan gates, webhook ingestion, CSV export/import stubs, Stripe billing stubs, and AI authoring hook points.

---

## Repo Layout

```
apps/
  web/               # Next.js 15 (App Router): dashboard, editors, analytics UI, public LP renderer
  api/               # Rails 7.2 API: models, controllers, workers, webhooks, exports, experiments
packages/
  design-system/     # Reusable UI primitives (Button, Input, BlocksPalette, etc.)
  email-templates/   # React Email sources + rendering scripts
  templates/         # Landing & email template metadata/helpers
  web-docs/          # Storybook/docs stories (early component documentation)
docs/
  diagrams/          # .mmd (Mermaid) sources + exported PNGs
  screenshots/       # Static UI screenshots
```

**Dashboard snapshot**

![Dashboard](docs/screenshots/dashboard.png)

---

## Illustrative Demo Goals

| Category        | Intent (not guaranteed)        | Status    |
| --------------- | ------------------------------ | --------- |
| Onboarding      | Draft to first publish <10m    | Partial   |
| Experimentation | Variant allocation + SRM check | Basic     |
| Analytics       | Lightweight engagement view    | Partial   |
| Contracts       | Typed web ↔ API DTOs           | Partial   |
| Background      | Enqueue + worker chain         | Minimal   |
| RUM             | LCP/TTFB on demo pages         | Prototype |
| Security        | Signature verification sketch  | Missing   |

---

## Current features

> **Status:** partial / unstable — intended for a quick architectural walkthrough

* **Onboarding drawer** with dashboard CTAs & combined metrics endpoint (shape may change).
* **Email / Sequence designer (TipTap v3):**

  * Formatting (bold/italic/underline/strike), headings (H1–H3), lists, blockquote, code block, HR, links.
  * Slash command palette (`/`) to insert headings/lists/code/HR/image placeholder.
  * **Plain vs Rich** toggle; word/char counts; **SMS 160-char segment estimation** for `sms` blocks.
  * Drag-reorder blocks (email, wait, sms, branch); inline editors; remove actions.
  * Persistent **client-side draft store** (Zustand).
* **LP builder** with blocks (Hero / CTA / Subscribe / ThankYou / Features), **smart-crop** & focal; SSR `<picture>`.
* **Subscribe → double opt-in → welcome** worker chain (rate-limited).
* **Experiments**: variant selection, ramp control (simplified), **SRM** detection & χ² significance check, rudimentary trends.
* **RUM**: p50/p95 LCP/TTFB, device breakdown, CTA/signup events.
* **Analytics**: link cohorts, domain engagement, basic CSV exports.
* **Webhooks**: basic ingest + retry semantics (DLQ/replay concepts; not hardened).
* **Admin**: feature flags, per-org overrides, plan gates.
* **Image proxy**: Next route + sharp; signed URL helper.

**Sequence editor types**

```ts
interface SequenceDraft { id: string; name: string; updatedAt: number; blocks: SequenceBlock[] }
type SequenceBlock = EmailBlock | SmsBlock | WaitBlock | BranchBlock;
```

---

## Functional Requirements

| Slice          | Shows (simplified)          | Real Gaps                    |
| -------------- | --------------------------- | ---------------------------- |
| Onboarding     | Drawer UI steps             | No persisted progress        |
| Broadcasts     | Rich text draft editor      | No robust send pipeline      |
| Sequences      | Client-side draft blocks    | No scheduling/execution      |
| Landing Pages  | Block builder & preview     | Limited publishing rules     |
| Smart Crop     | Focal point transform       | No CDN strategy              |
| Subscribe Flow | Double opt-in happy path    | Limited error handling       |
| Experiments    | Allocation + SRM + χ²       | No lifecycle mgmt            |
| Analytics      | Minimal engagement snapshot | No warehouse/retention       |
| Audience       | Segments + CSV stub         | No scalable import           |
| Webhooks       | Basic ingest + retry        | No signature verify/DLQ auth |
| Billing        | Stub checkout path          | No real invoices/proration   |
| Exports        | CSV/JSON concept            | Streaming not hardened       |

---

## Non-Functional Requirements

| Quality       | Target / Mechanism                           |
| ------------- | -------------------------------------------- |
| Performance   | SSR LPs; SWR cache; sharp transforms (basic) |
| Reliability   | Sidekiq retries (basic)                      |
| Security      | Placeholder signatures/auth scoping          |
| Scalability   | Monolith only; no real load testing          |
| Observability | Barebones RUM + queue count (manual)         |
| Compliance    | Minimal; no formal processes                 |

---

## Back-of-the-envelope Calculations

| Metric              | Assumption                          | Result                        |
| ------------------- | ----------------------------------- | ----------------------------- |
| Creators            | 5k                                  | 5k                            |
| Subscribers/creator | 20k avg                             | 100M total                    |
| Broadcast cadence   | Weekly (4/mo)                       | 400M emails/mo                |
| Webhook multiplier  | 1.2× (opens/clicks/bounces)         | 480M events/mo                |
| Event storage (avg) | 1KB                                 | 480GB/mo raw                  |
| RUM sampling        | 1M views/day raw → 1–10% sample     | 0.1–1M/day stored             |
| Worker throughput   | 100 jobs/s per pod × 20 pods (hypo) | 2k jobs/s (**not validated**) |
| Postgres strategy   | Hot vs cold                         | Cold offloaded to warehouse   |

---

## Design Patterns & Architecture

| Topic               | Choice / Pattern                       | Rationale                                |
| ------------------- | -------------------------------------- | ---------------------------------------- |
| Server architecture | Rails MVC                              | Mature ecosystem, fast CRUD & jobs       |
| Web architecture    | Next.js App Router (MPA + islands)     | Hybrid SSR/CSR for SEO + speed           |
| Frontend modularity | Single repo (monolith)                 | Simplifies DX; micro-frontends deferred  |
| State management    | Component state + small Zustand stores | Minimal global footprint, explicit flows |
| UI primitives       | Radix + shadcn + Tailwind              | Accessible, composable, rapid styling    |
| Data flow           | Fetchers + SWR caching                 | Predictable, low hidden side effects     |
| Background jobs     | Sidekiq + Redis queues                 | Demonstrate enqueue + retry semantics    |
| Experimentation     | A/B with SRM + χ² significance         | Catch skew early                         |
| Media handling      | Sharp via Next image route             | On-demand resizing & optimization        |
| Observability       | Custom RUM + queue metrics             | Lightweight, focused signals             |

---

## Architecture Diagrams

> PNGs are checked in. Mermaid sources below are **validated** for stricter renderers.

### Flowchart (Mermaid source)

```mermaid
flowchart LR
  %% Subgraphs
  subgraph Web["Next.js Web"]
    Editor["LP / Email Editors"]
    Analytics["Analytics & Ops"]
    Public["Public LP (/p/:slug)"]
  end

  subgraph API["Rails API"]
    C["Controllers"]
    M["Models"]
    W["Workers — Sidekiq"]
  end

  %% Nodes (rectangles for max compatibility)
  DB["PostgreSQL"]
  Cache["Redis"]
  Queue["Sidekiq Queue"]
  SES["SES / Sendgrid"]
  Stripe["Stripe"]
  S3["S3 Image Assets"]
  ImgProxy["Next /img (sharp)"]

  %% Edges (unchained)
  Public -- "subscribe/confirm" --> C
  Editor -- "JSON REST" --> C
  Analytics -- "JSON REST" --> C
  C --> M
  M --> DB
  C --> Queue
  Queue --> W
  W --> SES
  C --> Stripe
  Web --> ImgProxy
  ImgProxy --> S3
  Public -- "RUM beacons" --> C
  M <-- "cache lookups" --> Cache
```

### Subscribe → Confirm → Welcome (Mermaid source)

```mermaid
sequenceDiagram
  autonumber
  participant V as Visitor (LP)
  participant Web as Next Public Page
  participant API as Rails API
  participant DB as Postgres
  participant Q as Sidekiq
  participant ESP as ESP (SES/Sendgrid)
  participant Hook as ESP Webhook Receiver

  %% Subscribe
  V->>Web: Submit email form
  Web->>API: POST /v1/public/subscribe { email, list_id, utm, ua, ip }
  API->>DB: UPSERT contact (email, list_id)
  API->>DB: INSERT event{kind: signup, stage: initiated, consent:{ts, ip, ua}}
  API->>DB: INSERT/UPSERT confirmation_token (contact_id, exp, used_at=null)

  alt Existing contact & unconfirmed
    API->>Q: Enqueue ConfirmationEmail(contact_id)
    API-->>Web: 202 { status: "pending_confirmation" }
  else Already confirmed
    API-->>Web: 200 { status: "already_confirmed" }
  else New contact
    API->>Q: Enqueue ConfirmationEmail(contact_id)
    API-->>Web: 202 { status: "pending_confirmation" }
  end

  Q->>ESP: Send confirmation email
  Note over V,ESP: User checks inbox and clicks link

  %% Confirm
  V->>API: GET /v1/public/confirm?t=TOKEN
  API->>DB: SELECT token (valid? unused? not expired?)
  alt Token valid & unused & not expired
    API->>DB: UPDATE confirmation_tokens.used_at = now()
    API->>DB: UPDATE contacts.confirmed_at = now()
    API->>DB: INSERT event{kind: confirm}
    API->>Q: Enqueue WelcomeEmail(contact_id)
    Q->>ESP: Send welcome email
    API-->>V: 302 /p/:slug/thanks
  else Token invalid/expired/used
    API->>DB: INSERT event{kind: confirm_failed, reason}
    API-->>V: 410 Gone (or 400) + CTA “Resend”
  end

  %% ESP webhooks → suppression & analytics
  ESP-->>Hook: delivery/open/click/bounce/complaint
  Hook->>API: POST /v1/hooks/esp {event, msg_id, email}
  API->>DB: UPSERT event + suppression (on bounce/complaint)

  %% Edge: resubmit existing email
  rect rgba(200,200,255,0.15)
    V-->>API: Resubmit same email
    API->>DB: SELECT contact
    alt Unconfirmed
      API->>Q: Enqueue ConfirmationEmail(contact_id)
      API-->>V: 200 { status: "pending_confirmation" }
    else Confirmed
      API-->>V: 200 { status: "already_confirmed" }
    end
  end

  %% Abuse / rate-limit
  rect rgba(255,245,200,0.25)
    API->>API: Check rate limit (per IP/email)
    alt Limit exceeded
      API-->>V: 429 Too Many Requests
    end
  end

  %% Worker retry / DLQ
  rect rgba(255,200,200,0.15)
    Q-->>API: (Retry) Job failure
    API->>Q: Re-enqueue with exponential backoff (max_retries=N)
    alt Exceeded max retries
      API->>DB: INSERT event{kind: job_dead_letter}
      API-->>API: Alert on-call / dashboard
    end
  end
```

---

## API Surface

| Domain      | Endpoint (prefix `/v1`)                | Purpose               | Notes                            |
| ----------- | -------------------------------------- | --------------------- | -------------------------------- |
| Auth        | `/auth/sign_in`                        | Session stub          | Enhance JWT later                |
| Pages       | `/pages`, `/blocks`                    | Landing pages CRUD    | Slug fetch via `/pages/slug`     |
| Broadcasts  | `/broadcasts`                          | Create & send emails  | Worker pipeline (stub)           |
| Sequences   | `/sequences`                           | Drip campaigns        | Scheduling TBD                   |
| Experiments | `/experiments`, `/experiments/results` | A/B config + results  | SRM & significance               |
| Metrics     | `/metrics/*`                           | Analytics series      | Cohorts, engagement              |
| RUM         | `/rum/*`                               | Perf & events summary | Client sampling                  |
| Audience    | `/segments`, `/imports`, `/exports`    | Segments + CSV jobs   | Jobs + polling                   |
| Webhooks    | `/webhooks/ingest`                     | ESP events intake     | DLQ & replay endpoints (concept) |
| Billing     | `/stripe/checkout`, `/stripe/webhook`  | Plan upgrade          | Stubbed                          |
| Public      | `/public/subscribe`, `/public/confirm` | Opt-in flow           | Tokens + redirect                |
| Admin       | `/feature_flags`, `/feature_overrides` | Flags & overrides     | Plan + % rollout                 |

Example response (cohorts):

```json
[{ "url": "https://example.com", "unique_clickers": 123, "ctr": 0.084 }]
```

---

## Data Model

| Table                     | Key Columns / JSON Fields                                                          | Purpose / Notes                            | Index Highlights                |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------- |
| orgs                      | id, name, plan                                                                     | Tenant / plan gating                       | plan; id PK                     |
| contacts                  | id, org\_id, email, confirmed\_at                                                  | Subscriber identity & opt-in state         | (org\_id,email) unique; org\_id |
| confirmation\_tokens      | contact\_id, token, slug, variant, expires\_at, used\_at                           | Double opt-in + attribution                | token unique; contact\_id       |
| pages                     | id, org\_id, slug, theme\_json                                                     | Landing pages + theme config               | (org\_id,slug) unique           |
| blocks                    | id, page\_id, kind, "order", data\_json                                            | Ordered LP content blocks                  | (page\_id,"order"); page\_id    |
| broadcasts                | id, org\_id, subject, html                                                         | One-off email sends                        | org\_id                         |
| deliveries                | id, org\_id, contact\_id, broadcast\_id, status, opened\_at, clicked\_at, metadata | Per-recipient delivery + engagement events | (broadcast\_id); (contact\_id)  |
| sequences (planned)       | id, org\_id, name, schedule\_json (future), active                                 | Drip container (client draft)              | (org\_id,name) partial unique   |
| sequence\_steps (planned) | id, sequence\_id, kind, position, config\_json                                     | Normalized steps for server execution      | (sequence\_id,position)         |
| events                    | id, payload(jsonb), created\_at                                                    | RUM + analytics + experiment/CTA signals   | GIN(payload); created\_at DESC  |
| feature\_flags            | key, enabled, rollout\_pct                                                         | Global flag defaults                       | key unique                      |
| feature\_overrides        | org\_id, key, enabled                                                              | Org-scoped overrides                       | (org\_id,key) unique            |
| imports (planned)         | id, org\_id, kind, status, stats\_json                                             | CSV import jobs                            | org\_id; status                 |
| exports (planned)         | id, org\_id, kind, status, filter\_json                                            | Export jobs                                | org\_id; status                 |

---

## Health & Diagnostics

| Aspect       | Mechanism / Endpoint                              | Notes                               |
| ------------ | ------------------------------------------------- | ----------------------------------- |
| API health   | `GET /health` (Rails) returns `{ ok, db, redis }` | Consumed by web proxy `/api/health` |
| Proxy timing | `x-proxy-duration-ms` header                      | Next → Rails round-trip latency     |
| UI error log | `POST /api/app/events` kind:`ui_error`            | Fire-and-forget capture             |
| Queue stats  | (future) `GET /ops/queues`                        | Sidekiq latency / depth / retry     |
| Webhook DLQ  | `GET/POST /ops/webhooks`                          | Replay/retry controls               |
| RUM metrics  | `GET /ops/rum`                                    | LCP/TTFB/device breakdown           |
| Experiments  | `GET /ops/experiments`                            | SRM & significance overview         |

UI error event example:

```json
{
  "kind": "ui_error",
  "scope": "page_create",
  "message": "Failed to save",
  "slug": "pricing",
  "ts": 1731012345678
}
```

---

## AI Integration Hooks

* **Authoring:** subject scoring, tone rewrite, CTA variants, layout auto-fill.
* **Template gallery:** semantic search + “build from prompt”.
* **Segment copilot:** “contacts who clicked pricing and didn’t purchase”.
* **Analytics insights:** “why did CTR drop last week?” (anomaly + narrative).
* **Ops:** auto-triage webhook failures with suggested replay windows.
* **Guardrails:** Bayesian bandits for allocation; auto-tune ramp % within constraints.

---

## Getting Started

### Prereqs

* Ruby **3.4.x**
* Node **22.x** (Corepack enabled)
* Postgres **15+**
* Redis **7+**
* `vips` (for sharp, if needed)

### Environment Variables

Create `.env` (or export in your shell). Typical keys:

| Key                   | Example / Default                            | Where used       | Notes                              |
| --------------------- | -------------------------------------------- | ---------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000`                      | Next.js (client) | Proxy target for web → API         |
| `DATABASE_URL`        | `postgres://user:pass@localhost:5432/dev_db` | Rails API        | Or use local `config/database.yml` |
| `REDIS_URL`           | `redis://localhost:6379/0`                   | Sidekiq + cache  |                                    |
| `FAKE_STRIPE`         | `true`                                       | API billing stub | Returns fake checkout URL          |
| `S3_EMULATOR`         | `true`                                       | Media            | If using MinIO in Docker           |
| `RAILS_ENV`           | `development`                                | Rails            |                                    |
| `NODE_ENV`            | `development`                                | Next.js          |                                    |

**.env example**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
FAKE_STRIPE=true
S3_EMULATOR=true
REDIS_URL=redis://localhost:6379/0
```

### Local Dev (no Docker)

Start services (separate tabs):

```bash
pnpm dev:api        # Rails on :4000
pnpm dev:web        # Next.js on :3000
pnpm dev:sidekiq    # optional: Sidekiq (queues: default, mailers)
```

Visit `http://localhost:3000` → redirects to `/dashboard`.

**Common fixes**

| Symptom             | Fix                                               |
| ------------------- | ------------------------------------------------- |
| 500 ECONNREFUSED    | Ensure Rails on :4000 & `NEXT_PUBLIC_API_URL` set |
| Missing images      | Use local ActiveStorage                           |
| Jobs not processing | Start Sidekiq (`pnpm dev:sidekiq`)                |
| Editor SSR warning  | RichEditor is client/dynamic (already set)        |

### Docker Dev

```bash
cp .env.example .env
docker compose up --build

# DB
docker compose exec api bin/rails db:create db:migrate db:seed
docker compose exec api bin/rails rake seed:demo_data
docker compose exec api bin/rails rake seed:ai_demo  # optional

# MinIO bucket (first time)
mc alias set local http://localhost:9000 minio minio12345 || true
mc mb local/dev-bucket || true
```

Key routes:

* Web: `/` · LP Editor `/page/[id]/edit` · Audience `/audience`
* Public LP: `/p/[slug]`, `/p/[slug]/thanks`
* Broadcast analytics: `/analytics/broadcast/[id]`
* Ops: `/ops/queues`, `/ops/webhooks`, `/ops/rum`, `/ops/experiments`
* Admin: `/admin/flags`, `/admin/plan`, `/admin/experiments`
* Dev helper (development only): `/v1/dev/latest_confirmation` (fetch latest confirmation token for tests)

**Offline stack additions**

* MinIO at `:9000` (bucket: `dev-bucket`, `S3_EMULATOR=true`)
* Mailhog SMTP on `:1025`, UI at `http://localhost:8025`
* Sidekiq processes `default` + `mailers`

### E2E (Playwright)

```bash
cd apps/web
pnpm exec playwright test
```

Covers landing page subscribe → token retrieval → confirm redirect.

### Makefile Shortcuts

```bash
make setup     # copy .env.example
make up        # docker compose up --build
make seed      # db:seed inside container
make reset-db  # drop, recreate, migrate, seed
make e2e       # run Playwright suite
make stripe-fake # trigger fake webhook update
```

---

## Known Gaps

| Area                     | Current State         | Limitation                                     |
| ------------------------ | --------------------- | ---------------------------------------------- |
| Sequence scheduling      | Draft only            | No send/queue logic (no cron/backoff)          |
| Sequence branching       | Text placeholder      | No parser/evaluation engine                    |
| Editor images            | Disabled              | TipTap v3/v2 ext mismatch                      |
| Code highlighting        | Basic `<pre><code>`   | Lowlight deferred                              |
| Deliverability analytics | Domain/link cohorts   | No bounce taxonomy / seed list                 |
| Feature flags            | UI toggle + overrides | No audit trail or complex targeting            |
| Webhook security         | Basic ingest          | Missing signature verify & replay auth scoping |
| Billing                  | Fake Stripe flag      | No real subscription lifecycle/invoices        |
| RUM                      | LCP/TTFB only         | No INP/CLS/long tasks                          |
| Experiments              | SRM + χ²              | No sequential/Bayesian approaches              |
| Access control           | Plan gates            | No roles/permissions                           |

---

## Future Considerations

* **Editor**: restore image + syntax highlight once TipTap v3 ecosystem matures; add AI rewrite/subject scoring endpoints.
* **Sequence engine**: scheduling (delays, retry, calendar rules), branch evaluator (safe sandbox), per-step reporting.
* **Segmentation**: rule builder with preview counts, nested AND/OR, event property filters.
* **Deliverability**: seed lists, bounce/complaint taxonomy, reputation scoring, inbox placement simulations.
* **Webhook Security**: provider signature verification, rotating secrets, per-org signing keys, replay nonces.
* **Billing**: real Stripe checkout/webhooks, proration, usage tracking.
* **Warehouse/Analytics**: stream events to ClickHouse/BigQuery; dbt models; retention/cohort dashboards.
* **Performance**: add INP/CLS/long task tracking; queue saturation alerts.
* **Privacy/Compliance**: DSAR export/delete, consent versioning, PII encryption at rest.
* **Access Control**: org roles (Owner/Admin/Editor/Viewer) + entitlements matrix.
* **Testing**: contract tests for sequence API; synthetic RUM baseline in CI.

---

## Glossary

* **LP** — Landing Page (public page at `/p/:slug`).
* **SRM** — Sample Ratio Mismatch (allocation skew detector).
* **RUM** — Real User Monitoring (LCP/TTFB/INP signals).
* **DLQ** — Dead Letter Queue (failed jobs after max retries).
* **ESP** — Email Service Provider (SES/Sendgrid here).

---


