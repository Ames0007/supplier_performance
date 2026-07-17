-- =====================================================================
-- Seed 0004 — Supplier commodity categories. Ids match the in-memory seed so
-- category filters behave identically across environments. Idempotent.
-- =====================================================================

insert into supplier_categories (id, code, name) values
  ('c0000000-0000-0000-0000-000000000001', 'IT',       'Équipements informatiques'),
  ('c0000000-0000-0000-0000-000000000002', 'LAB',      'Équipements de laboratoire'),
  ('c0000000-0000-0000-0000-000000000003', 'WORKS',    'Travaux'),
  ('c0000000-0000-0000-0000-000000000004', 'SERVICES', 'Prestations de services'),
  ('c0000000-0000-0000-0000-000000000005', 'CONSUM',   'Consommables')
on conflict (id) do nothing;
