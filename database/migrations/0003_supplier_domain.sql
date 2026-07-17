-- =====================================================================
-- Migration 0003 — Supplier domain (Phase 2). The Supplier is the central
-- aggregate root. No other business entities (POs, evaluations…) here.
-- Patterns: UUID PKs, audit timestamps, soft-delete, RLS-ready.
-- =====================================================================

create extension if not exists pgcrypto;

-- --- Commodity / category reference -------------------------------------------
create table if not exists supplier_categories (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

-- --- Supplier aggregate root --------------------------------------------------
create table if not exists suppliers (
  id            uuid primary key default gen_random_uuid(),
  sap_ref       text,                                   -- populated by SAP sync (Phase 3)
  code          text not null unique,
  name          text not null,
  legal_name    text,
  category_id   uuid references supplier_categories(id) on delete set null,
  campus_id     uuid,
  country       text,
  city          text,
  email         text,
  phone         text,
  tax_id        text,
  lifecycle_status text not null default 'PROSPECT'
    check (lifecycle_status in ('PROSPECT','APPROVED','PREFERRED','STRATEGIC',
                                'UNDER_OBSERVATION','CRITICAL','BLOCKED','ARCHIVED')),
  tier          text check (tier in ('STRATEGIC','PREFERRED','APPROVED','TRANSACTIONAL')),
  overlays      text[] not null default '{}',
  classification_effective_at timestamptz not null default now(),
  owner_user_id uuid references users(id) on delete set null,
  source        text not null default 'MANUAL' check (source in ('SAP','MANUAL')),
  blocked_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz                             -- soft delete (never hard-deleted)
);
create index if not exists idx_suppliers_status on suppliers(lifecycle_status);
create index if not exists idx_suppliers_tier on suppliers(tier);
create index if not exists idx_suppliers_category on suppliers(category_id);
create index if not exists idx_suppliers_owner on suppliers(owner_user_id);
create index if not exists idx_suppliers_sap_ref on suppliers(sap_ref);

-- --- Contacts (within the Supplier aggregate) ---------------------------------
create table if not exists supplier_contacts (
  id          uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  kind        text not null check (kind in ('SUPPLIER','INTERNAL')),
  name        text not null,
  role        text,
  email       text,
  phone       text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_supplier_contacts_supplier on supplier_contacts(supplier_id);

-- --- Documents foundation (metadata; file storage wired later) -----------------
create table if not exists supplier_documents (
  id               uuid primary key default gen_random_uuid(),
  supplier_id      uuid not null references suppliers(id) on delete cascade,
  name             text not null,
  doc_type         text not null,
  url              text,
  uploaded_by_id   uuid references users(id) on delete set null,
  uploaded_by_name text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_supplier_documents_supplier on supplier_documents(supplier_id);
