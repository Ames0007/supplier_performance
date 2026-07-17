# UM6P SPM — Phase 2: Supplier Domain Report

> **Objective:** implement the Supplier bounded context (C1) — the central aggregate root — and nothing else.
> **Authoritative baselines:** [ARCHITECTURE_BLUEPRINT](./ARCHITECTURE_BLUEPRINT.md) · [DOMAIN_MODEL](./DOMAIN_MODEL.md) · [FUNCTIONAL_DESIGN](./FUNCTIONAL_DESIGN.md) · [BUSINESS_ANALYSIS](./BUSINESS_ANALYSIS.md) · [UX specs](./ux/README.md).
> **Built on:** Phase 1 + Phase 1 Completion (auth/RBAC/audit/identity, production-ready).
> **Date:** 2026-07-16 · **Dev port unchanged:** http://localhost:3004.
> **Out of scope (not implemented):** Purchase Orders, SAP, Evaluations, Performance, Risk, Committees, Dashboards.

---

## 1. Features Implemented

**Supplier aggregate & lifecycle (DOMAIN_MODEL §3.1, §8.1)**
- Supplier aggregate root with identity, classification (tier + overlays value object), lifecycle status, contacts, documents, owner, source, soft-delete.
- Pure lifecycle transition rules (`supplier-lifecycle.ts`): approve · block · unblock · archive · reactivate — single source of truth, exhaustively tested. Performance/risk-driven transitions (→ Under Observation/Critical, committee promotion) are intentionally deferred to Phases 5–7.

**Commands (service) — each guarded by RBAC, publishes a domain event, writes audit, respects aggregate boundaries**
- `create` (→ Prospect, unique code enforced) · `update` · `approve` · `block` (mandatory reason) · `unblock` · `archive` · `reactivate` · `reclassify` (tier) · `addContact` / `removeContact` · `addDocument` / `removeDocument`.

**Queries (CQRS read side) — scope-aware per RBAC**
- `list` (search + filters: status, tier, category, campus) · `getDetail` (360° aggregate) · `getTimeline` (foundation, projected from the audit log) · `listCategories`.
- **Scope:** `suppliers.read.all` → all suppliers; `suppliers.read` → only owned suppliers. Mirrored by RLS.

**Supplier Classification** — tier (`STRATEGIC/PREFERRED/APPROVED/TRANSACTIONAL`) + overlays, changed via `reclassify` (audited); overlays reserved for later performance/risk phases.

**Supplier Search & Filters** — server-rendered filter bar (search, status, tier, category); deep-linkable via query string.

**Supplier Contacts** — supplier-side & internal contacts (add/remove), within the aggregate.

**Supplier Documents (foundation)** — document metadata (add/remove); file upload to Supabase Storage deferred (a URL may be attached now).

**Supplier Timeline (foundation, DOMAIN_MODEL §11)** — chronological, read-only projection sourced from the immutable audit log; later phases add PO/evaluation/risk/committee events to the same stream.

**Supplier 360° skeleton (Screen 4)** — standing/actions header + tabs: General · Contacts · Documents · Historique (timeline) live; Performance (Phase 5) & Risque (Phase 6) rendered as placeholders.

**Supplier list (Screen 3)** — filterable/searchable `DataTable` with tier & status badges; “Nouveau fournisseur” for managers; nav item enabled.

**CRUD UI** — create (`/suppliers/new`), edit (`/suppliers/[id]/edit`), and 360° lifecycle/classification/contacts/documents actions — all via RBAC-guarded server actions with `revalidatePath`.

---

## 2. Architecture Compliance

| Rule | Status |
|---|---|
| Only the Supplier domain implemented | ✅ deferred domains untouched (empty barrels) |
| Every action publishes a domain event | ✅ 12 supplier events |
| Every action respects RBAC | ✅ commands require `suppliers.manage`; reads scope by `suppliers.read[.all]` |
| Every action creates an audit entry | ✅ event-driven via `registerSupplierAuditSubscribers` (real actor) |
| Respect aggregate boundaries | ✅ writes go through the Supplier service/repository; cross-context only via events |
| Respect existing patterns | ✅ interface + in-memory default + Supabase repo swapped at the composition root; CQRS; lazy server-only persistence (client/test-safe) |
| DDD boundaries unchanged | ✅ cross-domain imports via barrels only; ESLint boundary rule passes |
| Dev port 3004 | ✅ unchanged |

**Notable design choices**
- **Command/Query separation** (`supplier.service` vs `supplier.queries`) sharing one repository instance at runtime; both swapped to Supabase together.
- **Supplier owns its audit wiring** (`supplier-audit.subscriptions`) so the Audit context stays generic (suppliers → audit, never the reverse).
- **Timeline reuses audit** as the Phase-2 event projection — no duplicate event store.
- **Lazy Supabase persistence** — the composition hooks dynamic-import their server-only repositories, keeping every feature barrel import-safe in client/test contexts.

---

## 3. Files

**Created — domain (`features/suppliers/`)**
- `types/supplier.ts`, `schemas/supplier.schema.ts`
- `constants/supplier-events.ts`, `constants/supplier-labels.ts`
- `services/supplier-lifecycle.ts`, `services/supplier.service.ts`, `services/supplier.queries.ts`, `services/supplier-audit.subscriptions.ts`
- `repositories/supplier.repository.ts` (interface + in-memory + shared instance), `repositories/supabase-supplier.repository.ts`
- `persistence.ts`, `actions.ts`, `index.ts`
- `components/`: `SupplierStatusBadge`, `SupplierTierBadge`, `SuppliersTable`, `SupplierFilters`, `SupplierForm`, `Supplier360Header`, `SupplierGeneralPanel`, `SupplierContactsPanel`, `SupplierDocumentsPanel`, `SupplierTimelinePanel`, `SupplierPlaceholderPanel`
- Tests: `supplier-lifecycle.test.ts`, `supplier.service.test.ts`, `supplier.queries.test.ts`

**Created — app & database**
- `app/(app)/suppliers/{page,loading}.tsx`, `app/(app)/suppliers/new/page.tsx`, `app/(app)/suppliers/[id]/page.tsx`, `app/(app)/suppliers/[id]/edit/page.tsx`
- `database/migrations/0003_supplier_domain.sql`, `database/policies/0003_supplier_domain_policies.sql`, `database/seed/0004_supplier_categories.sql`

**Modified**
- `lib/auth/permissions.ts` + `roles.ts` (add `suppliers.manage`), `database/seed/0002_rbac_seed.sql`
- `config/nav.ts` (enable Fournisseurs)
- `instrumentation.ts` (register supplier persistence + audit subscribers; await async hooks)
- `features/audit/types/audit-record.ts` (+`entityId` filter), `repositories/audit.repository.ts`, `repositories/supabase-audit.repository.ts`
- `features/audit/persistence.ts`, `features/administration/persistence.ts` (lazy server-only import — client/test safety)

---

## 4. Domain Events

Published by the Supplier aggregate → consumed by the Audit context (real actor):

| Event | Audit action | Trigger |
|---|---|---|
| `SupplierCreated` | `supplier.created` | create |
| `SupplierUpdated` | `supplier.updated` | update |
| `SupplierApproved` | `supplier.approved` | approve |
| `SupplierBlocked` | `supplier.blocked` | block (with reason) |
| `SupplierUnblocked` | `supplier.unblocked` | unblock |
| `SupplierArchived` | `supplier.archived` | archive |
| `SupplierReactivated` | `supplier.reactivated` | reactivate |
| `SupplierReclassified` | `supplier.reclassified` | reclassify (tier) |
| `SupplierContactAdded` / `Removed` | `supplier.contact_added/removed` | contacts |
| `SupplierDocumentAdded` / `Removed` | `supplier.document_added/removed` | documents |

Every event carries `supplierId`, `supplierName`, `actorId`, `actorName` (+ context such as `reason`/`tier`), and appears on the supplier Timeline.

---

## 5. Tests Executed

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` (DDD boundary + no-any) | ✅ exit 0 |
| `npm run test` | ✅ **57 passed / 13 files** (was 38/10) |
| `npm run build` | ✅ exit 0 — supplier routes dynamic (ƒ); middleware present |

**New coverage (19 tests):**
- Lifecycle transitions (approve/block/unblock/archive/reactivate validity) — 5.
- Service commands + event emission + invariants (unique code, mandatory block reason, blocked-reason clearing, no double-archive, reclassify, contacts, documents, real uploader) — 8.
- Query scope (read.all vs own vs none), search filter, out-of-scope detail denial, permitted detail — 6.

---

## 6. Remaining Placeholders / Deferred

- **Supplier 360° tabs** *Performance* (Phase 5) & *Risque* (Phase 6) render placeholders; POs/Evaluations/Committee tabs arrive with their phases.
- **Standing (SPI/SRI/confidence/rating)** — header notes they are unavailable until Phases 5–6.
- **Overlays** (`UNDER_OBSERVATION`, `HIGH_RISK`) & the performance/risk-driven lifecycle transitions — modeled, set later.
- **Documents** — metadata only; file upload to Supabase Storage deferred.
- **`sap_ref`** present on the aggregate; populated by Phase 3 SAP sync.
- **Live DB** — no Supabase project in this environment; SQL (migration/policies/seed) and the Supabase repository are reviewed artifacts and are exercised at runtime only when configured. Unconfigured ⇒ shared in-memory repository, and (per Phase 1) the app is fail-closed on auth.
- **Write-form UX** — server-action forms surface validation/conflict errors via the error boundary; richer inline field-error UX (useActionState) is a later refinement.

---

## 7. Next Recommended Phase

**Phase 3 — Purchase Orders + SAP synchronization (Engineering Master Plan P2/P3):** model the PO aggregate and items, ingest suppliers & POs through the SAP Anti-Corruption Layer (mock adapter first), detect completed POs, and populate `supplier.sapRef`. This unlocks Phase 4 (Evaluation Engine), which is what turns supplier records into performance.

Prerequisite ops (carry-over from Phase 1): provision Supabase + Entra, run `database/migrations` → `policies` → `seed` (now including `0003`/`0004`), generate `database/types/database.types.ts`, and smoke-test supplier CRUD + RLS scope end-to-end.

---
*Phase 2 delivered: the Supplier aggregate — the platform's centre of gravity — with full lifecycle, classification, contacts, documents, timeline foundation, scope-aware queries, and a 360° skeleton. Every mutation is RBAC-guarded, event-publishing, and audited. All quality gates green; no out-of-scope domains introduced.*
