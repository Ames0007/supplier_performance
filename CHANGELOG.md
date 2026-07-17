# Changelog

All notable changes to the UM6P Supplier Performance Management Platform are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The platform is pre-1.0; the public API and schema may change between phases.

## [Unreleased]

### Added
- **Public Development Mode** (temporary, flag-gated auth bypass for dev/demos): enabled when `NODE_ENV=development` or `NEXT_PUBLIC_PUBLIC_DEMO=true`; every request acts as the "Development Administrator" (SUPER_ADMIN), the sign-in page redirects to the dashboard, and a banner is shown on every page. Supabase Auth, Entra, middleware, RBAC, and audit are **not** removed — only the login requirement is bypassed. Off in Preview/Production without the flag. See `docs/PUBLIC_DEVELOPMENT_MODE.md`.
- **Repository governance**: `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and an expanded professional `README.md`.
- **GitHub migration**: project published to `github.com/Ames0007/supplier_performance` as the source of truth.

## Phase 2 — Supplier Domain

### Added
- **Supplier aggregate root** with identity, classification (tier + overlays), lifecycle status, contacts, documents, owner, and source.
- **Lifecycle** transition rules (approve · block · unblock · archive · reactivate) as a single, tested source of truth.
- **CQRS** command service (`create`/`update`/`approve`/`block`/`unblock`/`archive`/`reactivate`/`reclassify`/contacts/documents) and scope-aware query service (`list`/`getDetail`/`getTimeline`/`listCategories`).
- **Supplier search, filters, list (Screen 3)** and **360° skeleton (Screen 4)**: General · Contacts · Documents · Timeline live; Performance/Risk deferred to later phases.
- **Timeline foundation** projected from the immutable audit log.
- 12 supplier **domain events**, each RBAC-guarded and audited; new `suppliers.manage` permission and RLS policies.
- Supabase repository + SQL (`0003` migration, policies, `0004` category seed) as reviewed artifacts.

## Phase 1 Completion — Production Authentication

### Added
- **Microsoft Entra ID SSO** via Supabase Auth (OAuth `azure`), OAuth callback and sign-out routes, protected-route middleware.
- Real identity resolution, persistent user repository, DB-backed authorization foundation, and audit actor resolution.
- `0001` identity/security migration, RLS policies, and RBAC seed.

### Removed
- Temporary auth seams: hardcoded super-admin session, anonymous admin access, and pass-through middleware.

### Security
- Fail-closed posture: no Supabase config ⇒ no session; strict server-only isolation of the service-role key.

## Phase 1 — Platform Foundation

### Added
- Next.js 15 (App Router) + React 19 + TypeScript (strict) shell with DDD folder structure.
- Shared UI (shadcn-style/Radix), layout shell, navigation, data table, feedback states, design tokens.
- Auth/RBAC/audit foundations, in-process event bus, composition root (`instrumentation.ts`), SAP mock adapter.
- Testing (Vitest + Playwright) and CI configuration; local dev fixed to port **3004**.

### Added (dev environment)
- Versioned health probes `/api/v1/live` (liveness) and `/api/v1/ready` (readiness); public in the access policy.
