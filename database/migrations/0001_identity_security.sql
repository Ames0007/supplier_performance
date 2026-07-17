-- =====================================================================
-- Migration 0001 — Identity & Security foundation (Phase 1 Completion)
-- Scope: identity/authz persistence ONLY. No business entities.
-- Patterns: UUID PKs, audit timestamps, soft-delete, RLS-ready (policies in
-- database/policies/0001_identity_security_policies.sql).
-- =====================================================================

create extension if not exists pgcrypto;

-- --- RBAC catalog (mirrors lib/auth; seeded in seed/0002_rbac_seed.sql) --------
create table if not exists roles (
  code        text primary key,
  title_fr    text not null,
  title_en    text not null,
  is_system   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists permissions (
  code        text primary key,      -- resource.action[.scope]
  resource    text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists role_permissions (
  role_code       text not null references roles(code) on delete cascade,
  permission_code text not null references permissions(code) on delete cascade,
  primary key (role_code, permission_code)
);

-- --- Users (identity from Microsoft Entra via Supabase Auth) -------------------
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  identity_ref text unique,                       -- Supabase auth uid / Entra subject
  email        text not null unique,
  display_name text not null,
  job_title    text,
  status       text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  last_login_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz                        -- soft delete (never hard-deleted)
);
create index if not exists idx_users_status on users(status);
create index if not exists idx_users_identity_ref on users(identity_ref);

-- --- Role assignments (per user) ----------------------------------------------
create table if not exists user_roles (
  user_id   uuid not null references users(id) on delete cascade,
  role_code text not null references roles(code) on delete restrict,
  primary key (user_id, role_code)
);
create index if not exists idx_user_roles_role on user_roles(role_code);

-- --- Scope assignments (campus / department; multi-campus & multi-entity) ------
create table if not exists user_scopes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  scope_kind text not null check (scope_kind in ('CAMPUS','DEPARTMENT')),
  scope_id   uuid not null,
  unique (user_id, scope_kind, scope_id)
);
create index if not exists idx_user_scopes_user on user_scopes(user_id);

-- --- Audit log (immutable, append-only — DOMAIN_MODEL §3.23) -------------------
create table if not exists audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_type   text not null default 'USER' check (actor_type in ('USER','SYSTEM')),
  actor_id     uuid,
  actor_name   text not null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  entity_label text,
  before       jsonb,
  after        jsonb,
  reason       text,
  ip           inet,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_audit_created_at on audit_logs(created_at desc);
create index if not exists idx_audit_entity on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_action on audit_logs(action);
