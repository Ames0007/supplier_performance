# Public Development Mode

> **⚠️ Temporary, development/demo-only feature.** This mode **bypasses authentication**. It is **not** production behaviour and must never be enabled for a real (Production) deployment. It exists so the team and stakeholders can browse every screen without configuring Microsoft Entra + Supabase first.

---

## 1. Why this mode exists

Real sign-in requires a fully wired identity stack: a Supabase project, a Microsoft Entra (Azure) app registration, OAuth redirect URLs, environment variables, and the database schema applied. Until all of that is in place, the platform is **fail-closed** — the sign-in button is disabled and no screen is reachable (this is by design).

For **local development** and **stakeholder demonstrations**, we need to walk through the UI immediately, without that setup. Public Development Mode provides exactly that: unrestricted browsing as a Development Administrator, while leaving the entire authentication implementation intact in the codebase.

## 2. What it does **not** change

Nothing about the real security model is removed or redesigned. All of the following stay in the codebase and remain fully in force whenever the mode is **off**:

- ✅ **Supabase Auth** — clients, session refresh, callback/sign-out routes.
- ✅ **Microsoft Entra integration** — the OAuth `azure` sign-in flow.
- ✅ **Middleware** — still runs and refreshes cookies on every request.
- ✅ **RBAC** — permission checks still execute; the demo user simply *satisfies* them (SUPER_ADMIN → all permissions).
- ✅ **Audit** — every mutation is still recorded (with the Development Administrator as the actor).

The mode **only bypasses the login requirement**.

## 3. How it works

A single flag function is the source of truth: [`lib/auth/dev-mode.ts`](../lib/auth/dev-mode.ts).

```ts
export function isPublicDemoMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PUBLIC_DEMO === "true"
  );
}
```

When it returns `true`, four small, flag-gated hooks activate:

| # | Location | Behaviour when the mode is ON |
|---|---|---|
| 1 | [`lib/auth/session.ts`](../lib/auth/session.ts) → `getSession()` | Returns the **Development Administrator** session (built via the normal `buildSession`, role `SUPER_ADMIN`). The real session resolver is left registered and is used again as soon as the mode is off. |
| 2 | [`middleware.ts`](../middleware.ts) | Treats every request as authenticated, so protected routes are reachable and `/sign-in` redirects to `/`. Cookie refresh still runs; the middleware is not removed. |
| 3 | [`app/(auth)/sign-in/page.tsx`](../app/(auth)/sign-in/page.tsx) | Immediately `redirect("/")` — no login screen during a demo. |
| 4 | [`app/layout.tsx`](../app/layout.tsx) via [`PublicDemoBanner`](../components/layout/PublicDemoBanner.tsx) | Renders the banner **"Public Development Mode – Authentication Disabled"** on every page. |

Because every guard, layout, and server action resolves identity through `getSession()`, that one short-circuit is sufficient — no call site needed special-casing.

### The Development User

| Field | Value |
|---|---|
| Name | **Development Administrator** |
| Role | **SUPER_ADMIN** (grants `ALL_PERMISSIONS` via the RBAC catalog) |
| Department | Procurement |
| Email | `dev-admin@um6p.local` |

This user exists **only** in this mode. It is never provisioned, persisted, or resolvable through the real identity path.

## 4. How to enable it

- **Local development** — it is **on automatically** with `npm run dev` (because `NODE_ENV=development`). Open http://localhost:3004 and you land directly on the dashboard.
- **Vercel Preview demo** — set the environment variable and **redeploy**:
  ```
  NEXT_PUBLIC_PUBLIC_DEMO = true
  ```
  > `NEXT_PUBLIC_*` values are baked in at **build time**, so you must trigger a new deployment after setting it.

## 5. How to disable it — i.e. re-enable authentication

Authentication is restored the moment `isPublicDemoMode()` returns `false`:

- **On Vercel (Preview/Production):** ensure `NEXT_PUBLIC_PUBLIC_DEMO` is **unset** (or not `"true"`) and that the build runs with `NODE_ENV=production` (Vercel does this for all deployments by default). **Redeploy.** The banner disappears, `/sign-in` shows the Microsoft button, and protected routes require a real session again.
- **Locally, to test the real login flow:** because `NODE_ENV=development` forces the mode on, run the app in production mode instead:
  ```bash
  npm run build
  npm run start        # NODE_ENV=production, flag unset → real auth
  ```
  (You will then need Supabase + Entra configured for sign-in to succeed — see the README "Deployment" section.)

There is **no code change required** to switch modes — it is purely environment-driven.

## 6. Why production security is unaffected

- **Off by default in Production.** Vercel builds/deploys with `NODE_ENV=production`. Unless someone explicitly sets `NEXT_PUBLIC_PUBLIC_DEMO=true`, `isPublicDemoMode()` is `false` and the real fail-closed path runs unchanged.
- **No code was removed or weakened.** The bypass is additive and entirely behind the flag; the authentication, RBAC, and audit implementations are untouched and covered by their existing tests.
- **Fail-closed remains the default.** With the flag off and no identity configured, there is still **no** session and **no** access — exactly as before this mode existed.
- **The mode is loud, not silent.** A high-contrast banner is shown on every page while it is active, so a demo build can never be mistaken for a secured one.

> **Operational guidance:** never set `NEXT_PUBLIC_PUBLIC_DEMO=true` on the Production environment. Restrict it to local dev and clearly-labelled Preview/demo deployments.
