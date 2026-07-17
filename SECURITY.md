# Security Policy

The UM6P Supplier Performance Management Platform handles procurement and supplier data governed by RBAC and Row-Level Security. Security is a first-class design constraint, not an afterthought.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, report privately to the UM6P Procurement platform team:

- Use GitHub's **[Private vulnerability reporting](https://github.com/Ames0007/supplier_performance/security/advisories/new)** (Security → Advisories), or
- Email the maintainers directly.

Please include: affected area, reproduction steps, impact assessment, and any suggested remediation. We aim to acknowledge reports within **5 business days** and to provide a remediation timeline after triage.

## Supported versions

The platform is pre-1.0 and under active development. Only the latest `main` branch is supported for security fixes.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| older commits | ❌ |

## Security posture (by design)

- **Fail-closed authentication.** With no identity provider configured, the app grants **no** session — every protected route redirects to sign-in. There is no demo/admin fallback.
- **Defence in depth.** Application-layer RBAC (permissions + role grants + scope) is backed by **PostgreSQL Row-Level Security** as an independent backstop.
- **Append-only audit.** Every domain mutation is recorded with the real actor; audit records are not mutable from the application.
- **Least privilege.** The Supabase **service-role key is server-only** and never exposed to the browser. The anon key is RLS-gated.
- **SAP isolation.** External systems are reached only through an Anti-Corruption Layer.

## Secrets & configuration

- **No secrets are committed.** `.env`, `.env.local`, and `.env.*.local` are git-ignored; only `.env.example` (empty placeholders) is tracked.
- Configure secrets via environment variables locally (`.env.local`) and via the hosting provider's encrypted environment settings in deployment (e.g. Vercel Project → Settings → Environment Variables).
- If you believe a secret has been committed, treat it as compromised: rotate it immediately and report per the process above.

## Responsible disclosure

We support coordinated disclosure and will credit reporters who wish to be acknowledged once a fix is released.
