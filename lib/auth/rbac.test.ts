import { describe, it, expect } from "vitest";
import { permissionsForRoles, hasPermission } from "./rbac";
import { ROLES } from "./roles";
import { PERMISSIONS } from "./permissions";

describe("RBAC", () => {
  it("grants admin permissions to SUPER_ADMIN", () => {
    const perms = permissionsForRoles([ROLES.SUPER_ADMIN]);
    expect(hasPermission(perms, PERMISSIONS.ADMIN_USERS_MANAGE)).toBe(true);
  });

  it("denies admin permissions to VIEWER", () => {
    const perms = permissionsForRoles([ROLES.VIEWER]);
    expect(hasPermission(perms, PERMISSIONS.ADMIN_USERS_MANAGE)).toBe(false);
  });

  it("treats an `.all` scope as satisfying the matching `.own` scope", () => {
    // AUDITOR holds evaluations.read.all → should satisfy evaluations.read.own.
    const perms = permissionsForRoles([ROLES.AUDITOR]);
    expect(hasPermission(perms, PERMISSIONS.EVALUATIONS_READ_OWN)).toBe(true);
  });

  it("merges permissions across multiple roles", () => {
    const perms = permissionsForRoles([ROLES.VIEWER, ROLES.AUDITOR]);
    expect(hasPermission(perms, PERMISSIONS.AUDIT_READ)).toBe(true);
    expect(hasPermission(perms, PERMISSIONS.DASHBOARDS_VIEW)).toBe(true);
  });
});
