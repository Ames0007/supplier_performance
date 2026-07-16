# UM6P — Supplier Performance Management Platform (SPM)

Enterprise platform for **Mohammed VI Polytechnic University (UM6P)** Procurement (Direction des Achats) to digitalize supplier performance evaluation end-to-end: SAP-synced Purchase Orders and suppliers, automatic evaluator assignment on PO completion, weighted scoring from a versioned evaluation matrix, permanent supplier performance history, and Procurement dashboards.

> **Current phase: Phase 0 — Architecture & Design.** No application code yet. The deliverable of this phase is the architecture blueprint below.

## 📐 Documentation
**Canonical model (single source of truth for business meaning):**
- **[Domain Model & Information Architecture](./docs/DOMAIN_MODEL.md)** — the **canonical business model** (14 sections): domain overview, DDD bounded contexts & context map, full entity catalog (with correct Aggregate/Entity/Value-Object/Read-Model classification), relationship model, aggregate roots & invariants, value objects, domain events, state machines, business-rules engine with precedence, 20 canonical business flows, information lifecycle, glossary, domain principles, future extensibility. Implementation-independent; sufficient for multiple teams to build the same platform. **Wins on any business-meaning disagreement.**

**Business (functional reference — approved by Director of Procurement):**
- **[Functional Design — SPM Operating Model](./docs/FUNCTIONAL_DESIGN.md)** — the **functional vision** (14 chapters): supplier lifecycle, classification/segmentation, performance governance, methodology (SPI/SRI/confidence/coverage), Supplier 360° view, Review Committee, improvement process, risk framework, supplier & business KPIs, dashboards, timeline, portfolio management, future roadmap & maturity model. Elevates the product to SAP Ariba SLP / Ivalua / Jaggaer / Coupa class.
- **[Business Analysis Document](./docs/BUSINESS_ANALYSIS.md)** — the functional reference (32 sections): context, problem, objectives, vision, stakeholders, As-Is/To-Be, scope, requirements (BR/FR/NFR), business rules, roles, personas, journeys, use cases, workflows, lifecycles, matrix model, notifications, dashboards, reporting, SAP business requirements, data ownership, risks, KPIs, acceptance criteria.
- **[Product Backlog](./docs/PRODUCT_BACKLOG.md)** — Epics → Features → User Stories (each with description, business value, priority, acceptance criteria); MVP definition.

**Build specification (functional specs & UX — eliminate ambiguity before dev):**
- **[Functional Specs & UX Blueprint](./docs/ux/README.md)** — build-ready specification for all **20 screens** + a global **UX Foundations** (design system, navigation shell, shared component/table/chart/form library, global states, validation, permissions, notifications, responsive, accessibility). Enterprise UX standard (SAP Fiori / Dynamics class). Every screen: wireframe, component hierarchy, fields, validation, permissions, states, user/navigation flows, acceptance criteria.

**Technical (design reference):**
- **[Architecture Blueprint](./docs/ARCHITECTURE_BLUEPRINT.md)** — the authoritative design (18 sections): architecture, folder structure, DDD domains, database, security, auth, SAP integration, roles, permissions, conventions, standards, design system, decisions.
- **[Development Roadmap](./docs/ROADMAP.md)** — phased, sprint-level delivery plan and governance gates.

**Execution (how engineers build it — first commit → production):**
- **[Engineering Master Plan](./docs/ENGINEERING_MASTER_PLAN.md)** — the implementation playbook (12 sections): repository & branch strategy, development phases, sprint planning, dependency graph & critical path, database/API/frontend build order, testing & CI/CD, release strategy, engineering risks, and a **Claude Code development plan** — the ordered backlog of small (<1 day), independently-testable, architecture-preserving prompts. Built for conflict-free parallel development (DDD slices + contract-first events).

> **Reading order:** the **Domain Model** fixes the canonical business meaning (entities, boundaries, events, invariants); Functional Design + Business Analysis + Product Backlog define *what & why* (business-approved); the Functional Specs & UX Blueprint defines *what it looks like & how it behaves* (build spec); Architecture Blueprint + Roadmap define *how & when* (technical); the **Engineering Master Plan** defines *how engineers execute it* (build order + Claude Code prompt backlog). Every layer traces back to the Domain Model and Business Analysis.

## 🚦 Current status
Documentation phase **complete** — all seven planning artifacts delivered. Next step: execute **Phase 0 (Platform)** from the [Engineering Master Plan §12](./docs/ENGINEERING_MASTER_PLAN.md#12-claude-code-development-plan), beginning with prompt `0.1` (repo scaffold). Resolve outstanding **[UM6P VALIDATION REQUIRED]** items in the discovery/domain workshop before entering dependent sprints.

## 🧱 Stack (target)
Next.js 15 (App Router) · React 19 · TypeScript (strict) · TailwindCSS · shadcn/ui · Lucide · React Hook Form · Zod · TanStack Table · TanStack Query · Recharts · Supabase (PostgreSQL + Auth + Storage + RLS) · Microsoft Entra ID SSO · Microsoft 365 (Outlook) notifications · SAP integration (Anti-Corruption Layer). Future: Power BI, Teams, multi-campus.

## 🎯 Core capabilities
- Synchronize Purchase Orders, Suppliers, Requesters, Purchasers from SAP.
- Detect completed POs and **auto-assign the correct evaluator**.
- Generate structured evaluations from a weighted, versioned matrix.
- Compute weighted performance scores and build supplier history.
- Governed access (RBAC + Row-Level Security), full audit trail, Procurement dashboards.

## 🏛️ Architecture in one line
A **modular monolith** (Next.js) with **Domain-Driven Design** bounded contexts, **Supabase + PostgreSQL RLS** as the security backstop, **Entra ID SSO**, and an **Anti-Corruption Layer** isolating SAP so the whole product is built against a mock adapter before live SAP connectivity exists.

## 🗂️ Repository layout (planned)
```
app/         Next.js routing only
features/    DDD bounded contexts (suppliers, purchase-orders, evaluations, matrix, dashboards, admin, notifications, audit, authentication)
components/  Shared, non-domain UI (shadcn/ui, DataTable, charts, feedback states)
lib/         Cross-cutting utils (supabase clients, auth/RBAC, validation, errors)
services/    Infrastructure integrations (sap ACL, mail, storage)
database/    Migrations, RLS policies, functions, views, seeds
```
See the blueprint for the full tree and rationale.

## ⚠️ Inputs required from UM6P
SAP release & integration path · Entra tenant details & role source · hosting mandate · brand assets · signed-off evaluation matrix · notification transport · retention policy. Full list in the blueprint's *Assumptions & UM6P Inputs Required* appendix.

## 📌 Status
Phase 0 complete once the blueprint and roadmap are approved at Gate G1 planning. Implementation begins at Phase 1 (Auth + RBAC + Shell).
