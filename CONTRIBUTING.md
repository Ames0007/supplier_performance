# Contributing to UM6P SPM

Thank you for contributing to the **UM6P Supplier Performance Management Platform**. This document describes how to set up your environment, the standards we hold, and the workflow for getting changes merged.

## Prerequisites

- **Node.js** ≥ 20 LTS
- **npm** ≥ 10
- A **Supabase** project (optional for most local work — the app runs against in-memory repositories when Supabase is not configured)

## Getting started

```bash
git clone https://github.com/Ames0007/supplier_performance.git
cd supplier_performance
npm install
cp .env.example .env.local   # optional — only needed for real auth/data
npm run dev                  # → http://localhost:3004
```

## Architecture ground rules

This is a **modular monolith** built with **Domain-Driven Design**. Please read [docs/DOMAIN_MODEL.md](./docs/DOMAIN_MODEL.md) and [docs/ARCHITECTURE_BLUEPRINT.md](./docs/ARCHITECTURE_BLUEPRINT.md) before making structural changes. The non-negotiables:

- **Bounded contexts** live under `features/<domain>/`. A feature is consumed **only through its barrel** (`features/<domain>/index.ts`). Deep imports across features are blocked by an ESLint boundary rule.
- **CQRS**: command services mutate; query services read. They share one repository instance at runtime.
- **Every mutation** publishes a **domain event**, respects **RBAC**, writes an **audit entry**, and honours **aggregate boundaries**.
- **Server-only** code (Supabase repositories) is loaded via lazy dynamic import so feature barrels stay import-safe in client/test contexts.
- **Fail-closed**: no config / no session / no resolver ⇒ no access.
- **Strict TypeScript** — `any` is disallowed by lint.

## Quality gates (must pass before a PR)

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (DDD boundaries + no-explicit-any)
npm run test        # vitest
npm run build       # next build
```

`npm run validate` runs typecheck + lint + test together. A Husky pre-commit hook is configured; do not bypass it (`--no-verify`) without a stated reason.

## Branching & commits

- Default branch: **`main`** (protected, source of truth).
- Branch names: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`.
- Commit messages follow **[Conventional Commits](https://www.conventionalcommits.org/)**: `feat(suppliers): add classification overlay`.
- Keep changes scoped to a single bounded context where possible; conflict-free parallel development is a design goal.

## Pull requests

1. Branch from `main`.
2. Ensure all four quality gates are green.
3. Reference the relevant phase / user story from [docs/PRODUCT_BACKLOG.md](./docs/PRODUCT_BACKLOG.md).
4. Describe **what** changed and **why**; note any new domain events, permissions, or migrations.
5. No secrets, `.env.local`, `node_modules`, or build artifacts in the diff.

## Reporting security issues

Do **not** open a public issue for vulnerabilities. See [SECURITY.md](./SECURITY.md).
