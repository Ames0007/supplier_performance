import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import { isRoleCode, ROLES, type RoleCode } from "@/lib/auth";
import type { Id } from "@/types";
import type { UserEntity, UserFilter, UserStatus } from "../types/user";
import type { UserRepository } from "./user.repository";

/**
 * Production user persistence (identity/security foundation) backed by Supabase.
 * Reads/writes the `users`, `user_roles` and `user_scopes` tables defined in
 * database/migrations. Row-Level Security is enforced by the database itself
 * (database/policies) — this repository never bypasses it (uses the request
 * client, not the service-role key).
 */
interface UserRow {
  id: string;
  email: string;
  display_name: string;
  job_title: string | null;
  status: string;
  last_login_at: string | null;
  identity_ref: string | null;
  created_at: string;
  updated_at: string;
}

function toStatus(value: string): UserStatus {
  return value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export class SupabaseUserRepository implements UserRepository {
  private async hydrate(row: UserRow): Promise<UserEntity> {
    const supabase = await createServerSupabase();
    const [{ data: roleRows }, { data: scopeRows }] = await Promise.all([
      supabase.from("user_roles").select("role_code").eq("user_id", row.id),
      supabase.from("user_scopes").select("scope_kind, scope_id").eq("user_id", row.id),
    ]);

    const roleCodes: RoleCode[] = (roleRows ?? [])
      .map((r) => r.role_code as string)
      .filter(isRoleCode);
    const campusIds: Id[] = (scopeRows ?? [])
      .filter((s) => s.scope_kind === "CAMPUS")
      .map((s) => s.scope_id as Id);
    const departmentIds: Id[] = (scopeRows ?? [])
      .filter((s) => s.scope_kind === "DEPARTMENT")
      .map((s) => s.scope_id as Id);

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      jobTitle: row.job_title,
      departmentIds,
      campusIds,
      roleCodes,
      status: toStatus(row.status),
      lastLoginAt: row.last_login_at,
      identityRef: row.identity_ref,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async findOne(column: "id" | "email" | "identity_ref", value: string) {
    const supabase = await createServerSupabase();
    const query = supabase.from("users").select("*").limit(1);
    const { data, error } =
      column === "email"
        ? await query.ilike("email", value)
        : await query.eq(column, value);
    if (error) throw AppError.internal("User lookup failed.", error);
    const row = (data ?? [])[0] as UserRow | undefined;
    return row ? this.hydrate(row) : null;
  }

  async list(filter?: UserFilter): Promise<UserEntity[]> {
    const supabase = await createServerSupabase();
    let query = supabase.from("users").select("*").order("display_name", { ascending: true });
    if (filter?.status) query = query.eq("status", filter.status);
    if (filter?.search) query = query.or(`display_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
    const { data, error } = await query;
    if (error) throw AppError.internal("User list failed.", error);
    const users = await Promise.all(((data ?? []) as UserRow[]).map((row) => this.hydrate(row)));
    return filter?.role ? users.filter((u) => u.roleCodes.includes(filter.role!)) : users;
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.findOne("id", id);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne("email", email);
  }

  findByIdentityRef(identityRef: string): Promise<UserEntity | null> {
    return this.findOne("identity_ref", identityRef);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const supabase = await createServerSupabase();
    const { error: upsertError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      job_title: user.jobTitle,
      status: user.status,
      last_login_at: user.lastLoginAt,
      identity_ref: user.identityRef,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
    if (upsertError) throw AppError.internal("User save failed.", upsertError);

    // Replace role assignments and scopes (small sets; idempotent).
    await supabase.from("user_roles").delete().eq("user_id", user.id);
    if (user.roleCodes.length > 0) {
      await supabase
        .from("user_roles")
        .insert(user.roleCodes.map((role_code) => ({ user_id: user.id, role_code })));
    }
    await supabase.from("user_scopes").delete().eq("user_id", user.id);
    const scopeRows = [
      ...user.campusIds.map((scope_id) => ({ user_id: user.id, scope_kind: "CAMPUS", scope_id })),
      ...user.departmentIds.map((scope_id) => ({ user_id: user.id, scope_kind: "DEPARTMENT", scope_id })),
    ];
    if (scopeRows.length > 0) await supabase.from("user_scopes").insert(scopeRows);

    return user;
  }

  async countActiveAdmins(): Promise<number> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, users!inner(status)")
      .eq("role_code", ROLES.SUPER_ADMIN);
    if (error) throw AppError.internal("Admin count failed.", error);
    return (data ?? []).filter(
      (r) => (r as { users?: { status?: string } }).users?.status === "ACTIVE",
    ).length;
  }
}
