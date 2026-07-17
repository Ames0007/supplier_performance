-- =====================================================================
-- Seed 0002 — RBAC catalog. Mirrors lib/auth (roles.ts, permissions.ts) so the
-- DB-side RLS (app_has_permission) matches the code-authoritative model.
-- Idempotent (ON CONFLICT DO NOTHING). Keep in sync with lib/auth.
-- =====================================================================

insert into roles (code, title_fr, title_en, is_system) values
  ('SUPER_ADMIN',          'Administrateur des achats / IT', 'Procurement Administrator / IT', true),
  ('PROCUREMENT_DIRECTOR', 'Directeur des achats',           'Procurement Director',           true),
  ('PROCUREMENT_MANAGER',  'Responsable catégorie / achats',  'Category / Procurement Manager', true),
  ('PURCHASER',            'Acheteur',                        'Purchaser',                      true),
  ('EVALUATOR',            'Demandeur / Chef de projet',      'Requester / Project Lead',       true),
  ('VIEWER',               'Consultation',                    'Viewer',                         true),
  ('AUDITOR',              'Audit',                           'Auditor',                        true)
on conflict (code) do nothing;

insert into permissions (code, resource, description) values
  ('admin.users.manage',        'administration', 'Manage users & role assignments'),
  ('admin.roles.manage',        'administration', 'Manage roles & permissions'),
  ('admin.settings.manage',     'administration', 'Manage platform settings'),
  ('audit.read',                'audit',          'Read the audit log'),
  ('suppliers.read',            'suppliers',      'Read suppliers in scope'),
  ('suppliers.read.all',        'suppliers',      'Read all suppliers'),
  ('suppliers.manage',          'suppliers',      'Create, edit, classify and manage suppliers'),
  ('purchase_orders.read',      'purchase_orders','Read purchase orders in scope'),
  ('purchase_orders.sync',      'purchase_orders','Trigger SAP synchronization'),
  ('evaluations.read.own',      'evaluations',    'Read own evaluations'),
  ('evaluations.read.all',      'evaluations',    'Read all evaluations'),
  ('matrix.read',               'matrix',         'Read the evaluation matrix'),
  ('matrix.manage',             'matrix',         'Manage the evaluation matrix'),
  ('committee.access',          'committee',      'Access the review committee'),
  ('dashboards.view',           'dashboards',     'View dashboards'),
  ('dashboards.view.executive', 'dashboards',     'View executive dashboards')
on conflict (code) do nothing;

-- SUPER_ADMIN → all permissions
insert into role_permissions (role_code, permission_code)
select 'SUPER_ADMIN', code from permissions
on conflict do nothing;

insert into role_permissions (role_code, permission_code) values
  -- PROCUREMENT_DIRECTOR
  ('PROCUREMENT_DIRECTOR','suppliers.read.all'),
  ('PROCUREMENT_DIRECTOR','suppliers.read'),
  ('PROCUREMENT_DIRECTOR','suppliers.manage'),
  ('PROCUREMENT_DIRECTOR','purchase_orders.read'),
  ('PROCUREMENT_DIRECTOR','evaluations.read.all'),
  ('PROCUREMENT_DIRECTOR','matrix.read'),
  ('PROCUREMENT_DIRECTOR','committee.access'),
  ('PROCUREMENT_DIRECTOR','dashboards.view'),
  ('PROCUREMENT_DIRECTOR','dashboards.view.executive'),
  -- PROCUREMENT_MANAGER
  ('PROCUREMENT_MANAGER','suppliers.read.all'),
  ('PROCUREMENT_MANAGER','suppliers.read'),
  ('PROCUREMENT_MANAGER','suppliers.manage'),
  ('PROCUREMENT_MANAGER','purchase_orders.read'),
  ('PROCUREMENT_MANAGER','evaluations.read.all'),
  ('PROCUREMENT_MANAGER','matrix.read'),
  ('PROCUREMENT_MANAGER','committee.access'),
  ('PROCUREMENT_MANAGER','dashboards.view'),
  -- PURCHASER
  ('PURCHASER','suppliers.read'),
  ('PURCHASER','purchase_orders.read'),
  ('PURCHASER','evaluations.read.own'),
  ('PURCHASER','dashboards.view'),
  -- EVALUATOR
  ('EVALUATOR','suppliers.read'),
  ('EVALUATOR','evaluations.read.own'),
  ('EVALUATOR','dashboards.view'),
  -- VIEWER
  ('VIEWER','suppliers.read'),
  ('VIEWER','dashboards.view'),
  -- AUDITOR
  ('AUDITOR','audit.read'),
  ('AUDITOR','suppliers.read'),
  ('AUDITOR','purchase_orders.read'),
  ('AUDITOR','evaluations.read.all'),
  ('AUDITOR','matrix.read'),
  ('AUDITOR','dashboards.view')
on conflict do nothing;
