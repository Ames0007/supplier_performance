-- =====================================================================
-- RLS policies — Identity & Security foundation
-- The database is the authorization BACKSTOP (ARCHITECTURE_BLUEPRINT §6):
-- even if an app check is missed, the DB denies the row. Default-deny.
-- =====================================================================

-- --- Helper functions (SECURITY DEFINER) --------------------------------------
-- Current app user id from the Supabase auth uid (users.identity_ref = auth.uid()).
create or replace function app_current_user_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.users
  where identity_ref = auth.uid()::text and deleted_at is null and status = 'ACTIVE'
  limit 1
$$;

-- Effective permission check for the current user (via roles → role_permissions).
create or replace function app_has_permission(required text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_code = ur.role_code
    where ur.user_id = app_current_user_id()
      and rp.permission_code = required
  )
$$;

create or replace function app_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select app_has_permission('admin.users.manage')
$$;

-- --- Enable RLS (default-deny once enabled) -----------------------------------
alter table roles            enable row level security;
alter table permissions      enable row level security;
alter table role_permissions enable row level security;
alter table users            enable row level security;
alter table user_roles       enable row level security;
alter table user_scopes      enable row level security;
alter table audit_logs       enable row level security;

-- --- RBAC catalog: readable by any authenticated user, no client writes -------
create policy roles_read        on roles            for select to authenticated using (true);
create policy permissions_read  on permissions      for select to authenticated using (true);
create policy role_perms_read   on role_permissions for select to authenticated using (true);

-- --- Users: self or admin can read; only admin can write ----------------------
create policy users_select_self_or_admin on users for select to authenticated
  using (id = app_current_user_id() or app_is_admin());
create policy users_write_admin on users for all to authenticated
  using (app_is_admin()) with check (app_is_admin());

-- --- User roles / scopes: self-read or admin; admin-managed -------------------
create policy user_roles_read on user_roles for select to authenticated
  using (user_id = app_current_user_id() or app_is_admin());
create policy user_roles_admin on user_roles for all to authenticated
  using (app_is_admin()) with check (app_is_admin());

create policy user_scopes_read on user_scopes for select to authenticated
  using (user_id = app_current_user_id() or app_is_admin());
create policy user_scopes_admin on user_scopes for all to authenticated
  using (app_is_admin()) with check (app_is_admin());

-- --- Audit log: readable with audit.read; append-only; NEVER update/delete ----
create policy audit_select on audit_logs for select to authenticated
  using (app_has_permission('audit.read'));
create policy audit_insert on audit_logs for insert to authenticated
  with check (true);
-- No UPDATE or DELETE policy exists → both are denied for all roles.
revoke update, delete on audit_logs from authenticated;
