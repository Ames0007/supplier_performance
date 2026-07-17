# UM6P SPM — Development Environment Report

> **Objective:** make the development environment fully operational and locally reachable.
> **Date:** 2026-07-17 · **Verdict:** ✅ **Operational.** The application boots and is reachable at **http://localhost:3004**; the versioned liveness probe returns HTTP 200.
> **Scope:** environment/config only. **No business functionality was added** — the sole code additions are infrastructure health probes.

---

## 1. Root Cause(s)

**Finding: the environment was not broken.** Dependencies were installed (408 packages), all four quality gates were already green, and the app boots cleanly. There was **no build failure, missing dependency, TypeScript error, port conflict, or broken import** to fix.

The one real issue was a **premise mismatch in the task, not a defect in the code:**

| # | Finding | Reality | Resolution |
|---|---|---|---|
| **R1** | Task assumes a **two-service topology** — frontend on `:3004` + a separate **backend on `:8004`**. | The platform is an **approved modular monolith (Next.js)**: a single process serves the UI *and* the server-side API (route handlers + server actions) on **one port, 3004**. Confirmed in the README ("A modular monolith (Next.js)…"), all six design documents, `.env.example` ("Frontend dev/prod port is fixed to 3004"), and the codebase. **Port 8004 appears nowhere** in the repository, and there is no `docker-compose.yml`, `Dockerfile`, or backend service. | Reconciled with the user: **keep the monolith on 3004** (no phantom backend fabricated). The "backend" API is served by Next.js on the same origin. |
| **R2** | Acceptance criterion requires a versioned liveness endpoint (`/api/v1/live`). | Only a legacy `/api/health` route existed. | Added `/api/v1/live` (liveness) and `/api/v1/ready` (readiness) as **infrastructure** route handlers, served on 3004, and made them public in the access policy. |

> **On port 8004:** because this is a single-process monolith, there is no second service to bind to `:8004`. Rather than fabricate one (which would contradict the approved architecture), the liveness contract lives where the app lives: **`http://localhost:3004/api/v1/live` → 200**. The user explicitly selected this "monolith on 3004 only" resolution.

---

## 2. Files Modified / Created

**Created**
- `app/api/v1/live/route.ts` — versioned **liveness** probe (`200 {"status":"live", …}`).
- `app/api/v1/ready/route.ts` — versioned **readiness** probe; reports dependency/config status (`ready` vs `degraded`).
- `docs/DEVELOPMENT_ENVIRONMENT_REPORT.md` — this report.

**Modified**
- `lib/auth/access-policy.ts` — added `/api/v1/live` and `/api/v1/ready` to `PUBLIC_EXACT` so probes return 200 (not a 307 auth redirect).
- `lib/auth/access-policy.test.ts` — added assertions that the two probes are public.
- `README.md` — added a **Local development** section (real topology, run command, ports, health endpoints, OAuth callback) and corrected the stale "no application code yet" status line.

**Not modified (verified already correct):** `package.json` scripts, `next.config.mjs`, `middleware.ts`, `playwright.config.ts`, `vitest.config.ts`, `.env.example` — all already reference port **3004** and required no change.

---

## 3. Configuration Changes

| Area | Change |
|---|---|
| **Ports** | **None required.** Frontend + API already on 3004 across `package.json` (`dev`/`start -p 3004`), `playwright.config.ts` (`baseURL`/`webServer.url` = 3004), `.env.example`. |
| **API base URL** | N/A — same-origin monolith; the frontend calls its own server (route handlers / server actions). No cross-origin API base URL exists. |
| **CORS** | N/A — single origin (3004). No cross-origin requests, so no CORS config is needed. |
| **Proxy** | None. (A dev reverse-proxy alias on 8004 was offered and **declined** in favour of the monolith reality.) |
| **Environment** | No new variables. `.env.local` remains optional; absent ⇒ fail-closed auth + in-memory repositories. |
| **OAuth redirect (dev)** | Callback route is `/auth/callback`; the URL to register in Supabase/Entra for local dev is **`http://localhost:3004/auth/callback`**. |

---

## 4. Final Ports

| Service | Port | Notes |
|---|---|---|
| **Frontend + API (Next.js monolith)** | **3004** | One process serves UI, route handlers, and server actions. |
| Backend (separate) | — | **Does not exist by design.** The monolith is the backend. |
| Database / Supabase | external | Managed Supabase project (URL/keys via env); not a locally-bound port. |

---

## 5. Startup Commands

```bash
# from um6p-spm-platform/
npm install            # once (already done: 408 packages)

# quality gates
npm run typecheck
npm run lint
npm run test
npm run build

# run the app (frontend + API, one process)
npm run dev            # → http://localhost:3004   (development)
npm run start          # → http://localhost:3004   (after `npm run build`)
```

---

## 6. Verification Results

**Quality gates** (all green):

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ exit 0 |
| Lint (DDD boundaries + no-any) | `npm run lint` | ✅ exit 0 |
| Tests | `npm run test` | ✅ **57 passed / 13 files** |
| Build | `npm run build` | ✅ exit 0 — `/api/v1/live` and `/api/v1/ready` registered (ƒ dynamic); middleware present (226 kB) |

**Live server** — `npm run dev` booted on **port 3004 in ~2 s**, then probed:

| Request | Result | Meaning |
|---|---|---|
| `GET /api/v1/live` | ✅ **200** `{"status":"live","app":"um6p-spm","version":"0.1.0",…}` | Liveness — process up & serving |
| `GET /api/v1/ready` | ✅ **200** `{"status":"degraded","checks":{"server":"ok","supabase":"not-configured"}}` | Readiness — up, dependencies not yet wired |
| `GET /api/health` | ✅ **200** `{"status":"ok",…}` | Legacy health (retained) |
| `GET /sign-in` | ✅ **200** (~33 KB rendered) | Public login page renders |
| `GET /` | ✅ **307 → /sign-in** | Correct **fail-closed** auth (no session) |
| `GET /suppliers` | ✅ **307 → /sign-in** | Protected route guarded |

**Connectivity chain:** Frontend (3004) → API route handlers (same origin) → health endpoints **200** → auth endpoints present (`/auth/callback`, `/auth/signout`; middleware enforces redirect) → Supabase **not configured in this environment** (readiness = `degraded`, as designed).

---

## 7. Remaining Issues / Notes

None block local startup. Open operational carry-overs (unchanged from prior phases):

- **Supabase not provisioned in this environment** — readiness is `degraded` and the app is fail-closed on auth (protected routes redirect to `/sign-in`). Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and register `http://localhost:3004/auth/callback` in the Supabase Azure provider to enable sign-in. This is expected, not a fault.
- **No `docker-compose.yml`** — deferred (tracked as M1 in the Phase 1 validation report). Add when wiring local Postgres/Supabase; not needed for the current in-memory dev boot.
- **Database migrations/policies/seed** (`0001`–`0004`) are reviewed SQL artifacts, applied only against a live Supabase project.
- **Readiness gating** — `/api/v1/ready` intentionally returns 200 on `degraded` so local dev works without Supabase; switch to 503-on-degraded behind a real load balancer if strict gating is wanted.

---

## 8. Summary

The development environment is **fully operational**: `npm run dev` boots the Next.js modular monolith on **http://localhost:3004**, all quality gates pass, and the versioned liveness probe **`http://localhost:3004/api/v1/live` returns HTTP 200**. The task's `:8004` backend does not exist because the platform is a single-process monolith by design; the liveness/readiness contracts were added on the app's own origin (3004) rather than by fabricating a second service.

*No business functionality was added — only infrastructure health probes and the access-policy/README/documentation updates needed to make and prove the environment operational.*
