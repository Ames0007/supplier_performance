-- =====================================================================
-- RLS policies — Supplier domain. Default-deny; scope mirrors the app RBAC:
--   suppliers.read.all → every supplier; suppliers.read → owned suppliers only.
-- Uses the helpers from policies/0001 (app_current_user_id, app_has_permission).
-- =====================================================================

alter table supplier_categories enable row level security;
alter table suppliers           enable row level security;
alter table supplier_contacts   enable row level security;
alter table supplier_documents  enable row level security;

-- --- Categories: readable by any authenticated user; managed by managers -------
create policy supplier_categories_read on supplier_categories for select to authenticated using (true);
create policy supplier_categories_manage on supplier_categories for all to authenticated
  using (app_has_permission('suppliers.manage')) with check (app_has_permission('suppliers.manage'));

-- --- Suppliers: scope-aware read; managers write ------------------------------
create policy suppliers_select on suppliers for select to authenticated
  using (
    deleted_at is null and (
      app_has_permission('suppliers.read.all')
      or (app_has_permission('suppliers.read') and owner_user_id = app_current_user_id())
    )
  );
create policy suppliers_manage on suppliers for all to authenticated
  using (app_has_permission('suppliers.manage'))
  with check (app_has_permission('suppliers.manage'));

-- --- Contacts & documents: readable if the parent supplier is readable --------
create policy supplier_contacts_select on supplier_contacts for select to authenticated
  using (
    exists (
      select 1 from suppliers s
      where s.id = supplier_id and s.deleted_at is null and (
        app_has_permission('suppliers.read.all')
        or (app_has_permission('suppliers.read') and s.owner_user_id = app_current_user_id())
      )
    )
  );
create policy supplier_contacts_manage on supplier_contacts for all to authenticated
  using (app_has_permission('suppliers.manage')) with check (app_has_permission('suppliers.manage'));

create policy supplier_documents_select on supplier_documents for select to authenticated
  using (
    exists (
      select 1 from suppliers s
      where s.id = supplier_id and s.deleted_at is null and (
        app_has_permission('suppliers.read.all')
        or (app_has_permission('suppliers.read') and s.owner_user_id = app_current_user_id())
      )
    )
  );
create policy supplier_documents_manage on supplier_documents for all to authenticated
  using (app_has_permission('suppliers.manage')) with check (app_has_permission('suppliers.manage'));
