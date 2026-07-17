<div align="center">

# UM6P — Supplier Performance Management Platform (SPM)

**Enterprise supplier performance management for Mohammed VI Polytechnic University (UM6P) Procurement.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

---

## 📖 Project overview

The **SPM Platform** digitalizes supplier performance management end-to-end for UM6P Procurement (Direction des Achats). It treats the **supplier** as the centre of gravity — a governed lifecycle from prospect to strategic partner — and layers performance, risk, and evaluation on top:

- **SAP-synced** Purchase Orders, Suppliers, Requesters, and Purchasers (through an Anti-Corruption Layer).
- **Automatic evaluator assignment** when a PO completes.
- **Weighted, versioned evaluation matrix** producing structured performance scores.
- **Permanent supplier performance history** and a **Supplier 360°** view.
- **Governed access** (RBAC + PostgreSQL Row-Level Security), a **full append-only audit trail**, and **Procurement dashboards**.

The product is designed to reach **SAP Ariba SLP / Ivalua / Jaggaer / Coupa** class. See the [Documentation index](#-documentation-index) for the full business and technical corpus.

> **Status:** Phases 1–2 implemented — authentication/RBAC/audit foundation + the Supplier domain. The app boots and is reachable at **http://localhost:3004**.

## 🏛️ Architecture

A **modular monolith** built with **Domain-Driven Design**: a single Next.js process serves both the UI and the server-side API (route handlers + server actions) on one origin. There is **no separate backend service**.

- **Bounded contexts** as vertical slices under `features/<domain>/`, each consumed only through its barrel (`index.ts`). Cross-feature deep imports are blocked by an ESLint boundary rule.
- **CQRS** — command services mutate; query services read; both share one repository instance at runtime and swap to Supabase together at the composition root.
- **Domain events** — every mutation publishes an event on an in-process event bus; the Audit context subscribes (suppliers → audit, never the reverse).
- **Security by design** — fail-closed auth, application RBAC backed by **RLS** as an independent backstop, append-only audit, server-only service-role key.
- **SAP isolation** — an **Anti-Corruption Layer** lets the whole product be built against a mock adapter before live SAP connectivity exists.

```
┌─────────────────────────── Next.js (modular monolith, :3004) ───────────────────────────┐
│  app/            Routing only (App Router): (app) protected · (auth) public · api/       │
│  features/       Bounded contexts — suppliers · authentication · administration · audit  │
│                  · (planned) purchase-orders · evaluations · matrix · dashboards          │
│  components/     Shared non-domain UI (shadcn-style/Radix, DataTable, feedback states)    │
│  lib/            Cross-cutting — supabase clients · auth/RBAC · events · errors · utils   │
│  services/       Infrastructure integrations — SAP ACL (mock first) · mail · storage      │
│  database/       Migrations · RLS policies · seeds                                         │
│  instrumentation.ts   Composition root — wires singletons at startup                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
              │                                   │
        Supabase (PostgreSQL + Auth + RLS)   Microsoft Entra ID SSO         SAP (via ACL)
```

Authoritative detail: [Architecture Blueprint](./docs/ARCHITECTURE_BLUEPRINT.md) · [Domain Model](./docs/DOMAIN_MODEL.md).

## 🧱 Technology stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router), **React 19** |
| Language | **TypeScript** (strict; `any` disallowed by lint) |
| UI | TailwindCSS · shadcn-style components (Radix) · Lucide · next-themes |
| Forms & validation | React Hook Form · **Zod** |
| Data & tables | TanStack Query · TanStack Table |
| Auth & data | **Supabase** (PostgreSQL + Auth + Storage + RLS) · **Microsoft Entra ID** SSO (OAuth `azure`) |
| Integration | **SAP** via Anti-Corruption Layer (mock adapter first) |
| Testing | **Vitest** (unit) · **Playwright** (e2e) · Testing Library |
| Tooling | ESLint (flat config + DDD boundary rule) · Prettier · Husky |
| Hosting (target) | **Vercel** (frontend + serverless API) · Supabase (managed Postgres) |

## 🛠️ Development setup

**Prerequisites:** Node.js ≥ 20 LTS, npm ≥ 10. A Supabase project is optional — without it the app runs against in-memory repositories (fail-closed on auth).

```bash
git clone https://github.com/Ames0007/supplier_performance.git
cd supplier_performance
npm install
cp .env.example .env.local     # optional — only for real auth/data
```

Environment variables (see [.env.example](./.env.example)):

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth/data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth/data | Public anon key (RLS-gated) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server auth/provisioning | **Server-only** — never exposed to the browser |

Register the OAuth callback `http://localhost:3004/auth/callback` (and your deployed URL) in the Supabase Azure provider.

## ▶️ Running locally

This platform is a **modular monolith** — one Next.js process serves UI + API on **one port**.

```bash
npm run dev            # → http://localhost:3004   (development)
npm run build          # production build
npm run start          # → http://localhost:3004   (serve the build)
```

| Concern | URL |
|---|---|
| Application | http://localhost:3004 |
| Liveness probe | http://localhost:3004/api/v1/live → `200 {"status":"live"}` |
| Readiness probe | http://localhost:3004/api/v1/ready → `200` (`ready` with Supabase, else `degraded`) |
| Legacy health | http://localhost:3004/api/health |

Without Supabase, the app is **fail-closed** — protected routes redirect to `/sign-in`; public routes and health probes still respond.

**Quality gates:**

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (DDD boundaries + no-explicit-any)
npm run test        # vitest
npm run build       # next build
npm run validate    # typecheck + lint + test
```

## 🚀 Deployment

Target platform: **Vercel** (the Next.js monolith deploys as frontend + serverless functions; the "backend" ships with it).

1. **Import** the GitHub repo into Vercel (Framework preset: **Next.js** — build/install/output are auto-detected: `next build` / `npm install` / `.next`).
2. **Set environment variables** in Vercel → Project → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **Register the production OAuth callback** (`https://<your-domain>/auth/callback`) in the Supabase Azure provider and Supabase Auth redirect allow-list.
4. **Apply the database migrations/policies/seeds** (`database/`) to the Supabase project.

> Vercel assigns its own port at runtime; the fixed `-p 3004` applies to local dev only and does not affect Vercel. See [docs/GITHUB_MIGRATION_REPORT.md](./docs/GITHUB_MIGRATION_REPORT.md) for deployment-readiness details. **Not yet deployed.**

## 📚 Documentation index

**Canonical model — wins on any business-meaning disagreement:**
- **[Domain Model & Information Architecture](./docs/DOMAIN_MODEL.md)** — canonical business model (entities, bounded contexts, events, invariants, state machines, 20 flows).

**Business (approved functional reference):**
- **[Functional Design — SPM Operating Model](./docs/FUNCTIONAL_DESIGN.md)** — the functional vision (14 chapters).
- **[Business Analysis](./docs/BUSINESS_ANALYSIS.md)** — functional reference (context → requirements → KPIs → acceptance).
- **[Product Backlog](./docs/PRODUCT_BACKLOG.md)** — Epics → Features → User Stories; MVP.

**Build specification:**
- **[Functional Specs & UX Blueprint](./docs/ux/README.md)** — all 20 screens + UX Foundations (wireframes, fields, validation, permissions, flows, acceptance criteria).

**Technical & execution:**
- **[Architecture Blueprint](./docs/ARCHITECTURE_BLUEPRINT.md)** — authoritative design (18 sections).
- **[Development Roadmap](./docs/ROADMAP.md)** — phased, sprint-level plan and governance gates.
- **[Engineering Master Plan](./docs/ENGINEERING_MASTER_PLAN.md)** — implementation playbook + ordered prompt backlog.

**Delivery reports:**
- [Phase 1 Validation](./docs/PHASE_1_VALIDATION_REPORT.md) · [Phase 1 Auth Completion](./docs/PHASE_1_AUTH_COMPLETION_REPORT.md) · [Phase 2 Supplier Domain](./docs/PHASE_2_SUPPLIER_DOMAIN_REPORT.md) · [Development Environment](./docs/DEVELOPMENT_ENVIRONMENT_REPORT.md) · [GitHub Migration](./docs/GITHUB_MIGRATION_REPORT.md).

> **Reading order:** the Domain Model fixes business meaning → Functional Design + Business Analysis + Backlog define *what & why* → the UX Blueprint defines *look & behaviour* → Architecture Blueprint + Roadmap define *how & when* → the Engineering Master Plan defines *how engineers execute it*.

## 🖼️ Screenshots

> _Placeholders — to be captured once the UI is populated with seed data._

| Screen | Preview |
|---|---|
| Sign-in (Entra SSO) | _`docs/screenshots/sign-in.png` (TODO)_ |
| Supplier list (Screen 3) | _`docs/screenshots/supplier-list.png` (TODO)_ |
| Supplier 360° (Screen 4) | _`docs/screenshots/supplier-360.png` (TODO)_ |
| Administration · Audit | _`docs/screenshots/audit.png` (TODO)_ |

## 🗺️ Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1** | Platform foundation — shell, DDD structure, RBAC/audit foundations, design system, testing/CI | ✅ Done |
| **1c** | Production authentication — Entra ID SSO via Supabase, identity resolution, protected routes | ✅ Done |
| **2** | **Supplier domain** — aggregate, lifecycle, classification, CRUD, search/filters, contacts, documents, timeline, 360° skeleton | ✅ Done |
| **—** | **GitHub migration & deployment prep** | ◐ In progress |
| **3** | Purchase Orders + **SAP synchronization** (mock ACL first); populate `supplier.sapRef` | ⏳ Planned |
| **4** | **Evaluation engine** — versioned matrix, auto evaluator assignment, weighted scoring | ⏳ Planned |
| **5** | **Performance** — SPI, coverage, confidence, standing | ⏳ Planned |
| **6** | **Risk** — SRI, risk framework, overlays | ⏳ Planned |
| **7** | **Review Committee, dashboards & notifications** (M365/Teams) | ⏳ Planned |

Full detail: [Development Roadmap](./docs/ROADMAP.md) · [Engineering Master Plan](./docs/ENGINEERING_MASTER_PLAN.md).

## 🤝 Contributing & security

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, architecture ground rules, quality gates, and the PR workflow. Report vulnerabilities privately per **[SECURITY.md](./SECURITY.md)**. Changes are tracked in **[CHANGELOG.md](./CHANGELOG.md)**.

## 📄 License

[MIT](./LICENSE) © 2026 Mohammed VI Polytechnic University (UM6P).
