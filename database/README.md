# `database/` — schema source of truth

Per ARCHITECTURE_BLUEPRINT, this directory owns the versioned Postgres schema:

- `migrations/` — ordered, timestamped, reversible SQL migrations
- `policies/` — Row-Level Security policies
- `functions/` — SQL functions & triggers
- `views/` — reporting / read-model views
- `seed/` — reference + demo data
- `types/database.types.ts` — generated Supabase types

## Phase 1 Completion — Identity & Security foundation

The **identity/authorization persistence foundation** is defined here (no business
entities):

| File | Contents |
|---|---|
| `migrations/0001_identity_security.sql` | `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `user_scopes`, `audit_logs` (UUID PKs, audit timestamps, soft-delete, append-only audit) |
| `policies/0001_identity_security_policies.sql` | RLS default-deny + helpers (`app_current_user_id`, `app_has_permission`, `app_is_admin`); audit is append-only (no UPDATE/DELETE) |
| `seed/0002_rbac_seed.sql` | RBAC catalog seed — mirrors `lib/auth` (roles/permissions), so DB-side RLS matches the code model |

**Runtime binding.** The application talks to these tables through the
`SupabaseUserRepository` / `SupabaseAuditRepository` (selected at the composition
root — `instrumentation.ts` — when Supabase is configured). Without configuration
the app uses the in-memory implementations and is **fail-closed** (no session).

**Applying (when the Supabase project exists):** run the migration, then the
policies, then the seed, via the Supabase SQL editor or CLI. `identity_ref` on
`users` stores the Supabase auth uid (`auth.uid()`), which the RLS helpers use to
resolve the current user. This environment has no live database, so these files
are the authoritative schema artifacts and are validated by review, not executed.
