import { AppError } from "@/lib/errors";
import { hasAnyPermission, hasPermission } from "./rbac";
import { type PermissionCode } from "./permissions";
import { getSession, type SessionUser } from "./session";

/** Require an authenticated session or throw `unauthorized`. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw AppError.unauthorized();
  return session;
}

/** Require a specific permission or throw `forbidden`. */
export async function requirePermission(code: PermissionCode): Promise<SessionUser> {
  const session = await requireSession();
  if (!hasPermission(session.permissions, code)) {
    throw AppError.forbidden(`Missing permission: ${code}`);
  }
  return session;
}

/** Pure UI helper — does this (possibly null) user hold the permission? */
export function can(user: SessionUser | null, code: PermissionCode): boolean {
  return user !== null && hasPermission(user.permissions, code);
}

/** Pure UI helper — does this user hold ANY of the permissions? */
export function canAny(user: SessionUser | null, codes: readonly PermissionCode[]): boolean {
  return user !== null && hasAnyPermission(user.permissions, codes);
}
