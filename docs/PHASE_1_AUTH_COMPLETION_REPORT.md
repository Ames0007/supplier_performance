# UM6P SPM — Phase 1 Completion (Authentication & Identity) Report

> **Objective:** replace the temporary authentication seams with production-ready
> identity & authorization, per the plan in [PHASE_1_VALIDATION_REPORT](./PHASE_1_VALIDATION_REPORT.md) (corrections C1–C4).
> **Authoritative baselines:** [ARCHITECTURE_BLUEPRINT](./ARCHITECTURE_BLUEPRINT.md) · [DOMAIN_MODEL](./DOMAIN_MODEL.md) · [ENGINEERING_MASTER_PLAN](./ENGINEERING_MASTER_PLAN.md) · [UX Foundations](./ux/00_UX_FOUNDATIONS.md).
> **Scope discipline:** only authentication, session, identity, RBAC binding, route protection, audit actor, and the identity/security DB foundation. **No business domains** (suppliers, POs, evaluations, performance, risk, SAP, dashboards) were added.
> **Date:** 2026-07-16 · **Dev port unchanged:** http://localhost:3004.

---

## 1. Implemented Features

### Authentication (Microsoft Entra ID → Supabase → app session)
- **Entra SSO via Supabase Auth** (OAuth `azure` provider). `MicrosoftSignInButton` initiates the OAuth redirect through the browser Supabase client with `redirectTo=/auth/callback?next=…`.
- **OAuth callback** (`app/auth/callback/route.ts`): exchanges the code for a session (sets httpOnly cookies), JIT-provisions the app user, records a real-actor `auth.signed_in` audit entry, and redirects to a sanitized internal `next`.
- **Sign-out** (`app/auth/signout/route.ts`, POST): clears the Supabase session server-side; wired from `UserMenu` via a POST form (no client import of server code).
- Full flow realized: **User → Entra login → Supabase session → app session → user resolution → role & permission resolution → protected app.**

### Session management & identity resolution
- `lib/supabase/{server,client,middleware,env}` — request-scoped, browser, and edge clients; all **env-guarded** and **fail-closed** when unconfigured.
- Session resolution lives in the Identity context (`features/authentication`): `getCurrentIdentity()` (Supabase user) → `resolveSessionFromIdentity()` (pure) → app `SessionUser` with roles, permissions and campus/department scope.
- `getSession()` in `lib/auth` is now a **fail-closed resolver** registered at the composition root (`instrumentation.ts`) — the same pattern used to wire audit subscribers. No hardcoded identity remains.

### RBAC (unchanged model, now bound to real identity)
- The existing `resource.action[.scope]` catalog and 7 canonical roles are unchanged. `.all ⇒ .own` scope inheritance preserved. Permissions are derived from the authenticated user's roles.

### User foundation (persistent)
- `UserRepository` extended with `findByEmail` / `findByIdentityRef`; **`SupabaseUserRepository`** added (reads/writes `users`, `user_roles`, `user_scopes`).
- **JIT provisioning** (`UserService.provisionFromIdentity`): first-seen identities become active users with the default role (`EVALUATOR`); existing users resolve by identity/email (no duplicates). Existing invariants preserved: **active users keep ≥1 role**, **last active administrator protected**.
- The `userService` singleton defaults to in-memory and is swapped to Supabase at the composition root when configured.

### Middleware route protection
- Production behaviour via a pure, edge-safe policy (`lib/auth/access-policy`): unauthenticated → redirect to `/sign-in?returnTo=…`; authenticated on `/sign-in` → redirect to `/`; public paths (`/sign-in`, `/auth/*`, `/api/health`) allowed. Session cookies refreshed on every request.
- Protected `(app)` segment marked `force-dynamic` so per-request session rendering is never statically cached.

### Audit actor resolution
- Every audited action now carries a **real actor** (or the explicit `SYSTEM` actor). Domain events carry `actorId`/`actorName`; the audit subscribers resolve them. New actions `auth.signed_in` / `auth.signed_out`. `recordView` logs the real viewer on the audit page (DOMAIN_MODEL §3.23). Audit never relies on a demo identity.

---

## 2. Architecture Compliance

| Rule | Status |
|---|---|
| Do not modify unrelated modules | ✅ Only auth/identity/audit + their consumers touched. |
| Do not introduce business domains | ✅ None added; deferred barrels untouched. |
| Do not bypass existing interfaces | ✅ Production persistence sits behind `UserRepository` / `AuditRepository`. |
| Do not remove auditability | ✅ Auditability strengthened (real actors, sign-in/out, view logging). |
| Do not change DDD boundaries | ✅ `getSession` stays in `lib/auth` (pages unchanged); resolution logic lives in `features/authentication`; composition wired at `instrumentation.ts`. |
| Keep permission model | ✅ Unchanged catalog + `.all/.own` inheritance. |
| Client/edge safety | ✅ `next/headers` + `server-only` isolated from client/edge bundles (build verified). |
| Dev port 3004 | ✅ Unchanged. |

**Key design choices (consistent with existing patterns):**
- **Composition root** (`instrumentation.ts`) registers the session resolver, selects persistent repositories, and subscribes audit — mirroring how the event bus was already wired.
- **Pure, injectable session resolution** (`resolveSessionFromIdentity`) is unit-tested without Supabase/DB.
- **Fail-closed everywhere**: no configuration / no identity / no resolver ⇒ **no session** (never a privileged fallback).

---

## 3. Security Improvements

| Before (Phase 1 foundation) | After (this phase) |
|---|---|
| `getSession()` returned a hardcoded **SUPER_ADMIN** unconditionally | Removed. Real Supabase/Entra identity; **fail-closed** default (null session). |
| **Anonymous admin access** possible if deployed | Eliminated. No session ⇒ redirected to `/sign-in`; unconfigured ⇒ no access. |
| **Pass-through middleware** (no protection) | Real protection: token re-validated (`getUser()`), unauthenticated redirected, session cookies refreshed. |
| Audit actor could be a demo identity | Every action carries a **real actor** or explicit `SYSTEM`. |
| No persistence / no DB authorization | Supabase-backed users + **RLS default-deny** policies; **append-only** audit (no UPDATE/DELETE grant). |
| Secrets | anon key only on client; **service-role key server-only**; nothing committed. |

Additional hardening: OAuth `redirectTo`/`next` restricted to internal single-slash paths; sign-out is POST-only; `import "server-only"` guards on server modules; `getUser()` (not `getSession()`) used in middleware to re-validate tokens.

---

## 4. Files Created / Modified

**Created (23)**
- `lib/supabase/env.ts`, `server.ts`, `client.ts`, `middleware.ts`
- `lib/auth/access-policy.ts` (+ `access-policy.test.ts`, `guards.test.ts`)
- `features/authentication/services/identity.ts`, `session.service.ts`, `resolver.ts` (+ `session.service.test.ts`)
- `features/administration/repositories/supabase-user.repository.ts`, `features/administration/persistence.ts`
- `features/audit/repositories/supabase-audit.repository.ts`, `features/audit/persistence.ts`
- `app/auth/callback/route.ts`, `app/auth/signout/route.ts`
- `database/migrations/0001_identity_security.sql`, `database/policies/0001_identity_security_policies.sql`, `database/seed/0002_rbac_seed.sql`
- `docs/PHASE_1_AUTH_COMPLETION_REPORT.md` (this)

**Modified (22)**
- `lib/supabase/index.ts`, `lib/auth/session.ts`, `lib/auth/index.ts`
- `features/authentication/index.ts`, `components/MicrosoftSignInButton.tsx`
- `features/administration/repositories/user.repository.ts`, `services/user.service.ts`, `index.ts`
- `features/audit/types/audit-record.ts`, `services/audit.service.ts`, `services/audit-subscriptions.ts`, `index.ts`
- `middleware.ts`, `instrumentation.ts`, `components/layout/UserMenu.tsx`
- `app/(auth)/sign-in/page.tsx`, `app/(app)/layout.tsx`, `app/(app)/administration/audit/page.tsx`
- `package.json`, `.env.example`, `database/README.md`
- `features/administration/services/user.service.test.ts`, `features/audit/services/audit.service.test.ts`

**Deleted (1)**
- `features/authentication/services/auth.service.ts` (obsolete stub replaced by the real flow).

---

## 5. Database Changes (identity/security foundation only)

New SQL artifacts under `database/` (no business entities):
- **Tables:** `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `user_scopes`, `audit_logs` — UUID PKs, audit timestamps, soft-delete on `users`, indexes.
- **RLS (default-deny)** + helpers `app_current_user_id()`, `app_has_permission(text)`, `app_is_admin()`. Users are self/admin readable, admin-writable; audit is readable with `audit.read`, **append-only** (UPDATE/DELETE revoked).
- **Seed** mirrors `lib/auth` so DB-side RLS matches the code catalog.
- **Runtime binding:** `SupabaseUserRepository` / `SupabaseAuditRepository`, selected at the composition root when configured; `users.identity_ref` stores the Supabase `auth.uid()` used by RLS.

> This environment has no live database; the SQL is the authoritative schema artifact and is validated by review. Apply via the Supabase CLI/SQL editor when the project exists.

---

## 6. Tests Executed

All commands run locally (dev port 3004 unchanged):

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` (incl. DDD boundary + no-any) | ✅ exit 0 |
| `npm run test` | ✅ **38 passed / 10 files** (was 23/7) |
| `npm run build` | ✅ exit 0 — all app routes **dynamic (ƒ)**; middleware present; client/edge bundles clean |

**New/updated coverage:**
- Route access policy — unauthenticated redirect, public-path allow, authed-away-from-/sign-in, authorized access, path classification (5).
- Auth guards — fail-closed `requireSession`, authorized `requirePermission`, forbidden `requirePermission` (3).
- Session resolution — permissions + scope for active user, null for inactive, null when unprovisioned (3).
- Provisioning — JIT create with default role, resolve-existing-by-email no duplicate (2 added).
- Audit actor — real actor from payload, SYSTEM fallback (2 added).

---

## 7. Remaining Risks

| # | Risk | Severity | Mitigation / Note |
|---|---|---|---|
| A1 | End-to-end SSO not runtime-verified here (no live Supabase project/Entra tenant in this environment) | Med | Code follows the canonical `@supabase/ssr` App-Router pattern; typecheck/build pass. Verify against a real Supabase + Entra tenant during deployment (see below). |
| A2 | Supabase repositories & RLS not executed (no live DB) | Med | Implemented behind interfaces; SQL reviewed. Run migrations/policies/seed and smoke-test isolation before production. |
| A3 | Session resolver depends on `instrumentation.register` sharing the module instance with RSC | Low | Mirrors the already-relied-upon event-bus wiring; fail-closed if unset (availability, not security). Confirm in a runtime smoke test. |
| A4 | RBAC catalog exists in code **and** DB seed | Low | Code is authoritative at runtime; seed only powers RLS. Keep in sync (documented in the seed header). |
| A5 | `provisionFromIdentity` may write on first request if the callback didn't provision | Low | Idempotent (create-if-missing); common path is read-only. |
| A6 | Dependency audit reports vulnerabilities (transitive) | Low | Run `npm audit` triage during hardening; none introduced by app code. |

---

## 8. Next Recommended Implementation Phase

**Phase 2 — Supplier Domain (read side)** per the Engineering Master Plan: the Supplier aggregate, list (Screen 3) and 360° read views, and reference data — now that a real, permission-scoped identity exists to enforce access. Prerequisite operational tasks before/along with it:

1. **Provision Supabase + configure the Entra (Azure) OAuth provider**, set the env vars, run `database/migrations` → `policies` → `seed`, and run an end-to-end login smoke test (login → provision → protected page → sign-out) to close risks A1–A3.
2. Generate `database/types/database.types.ts` from the live schema and type the Supabase repositories against it.

---
*Phase 1 Completion delivered: the authentication & authorization foundation is production-safe by construction (fail-closed, no anonymous admin, DB-enforced RLS, real-actor audit), with all quality gates green. No business domains were introduced.*
