# `database/` — schema source of truth

Per ARCHITECTURE_BLUEPRINT, this directory owns the versioned Postgres schema:

- `migrations/` — ordered, timestamped, reversible SQL migrations
- `policies/` — Row-Level Security policies (one file per table)
- `functions/` — SQL functions & triggers (incl. `set_audit_fields`, `write_audit_log`)
- `views/` — reporting / read-model views
- `seed/` — reference + demo data
- `types/database.types.ts` — generated Supabase types

**Phase 1 status (foundation):** the domain runs behind repository *interfaces*
with in-memory implementations (portable, testable, no external infra), so no
migrations exist yet. The concrete Supabase schema, RLS policies, audit triggers,
and generated types are produced at **P1 completion**, when the Supabase project
and Microsoft Entra SSO are provisioned. See "Remaining dependencies" in the
Phase 1 completion report.
