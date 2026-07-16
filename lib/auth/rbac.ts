import { type PermissionCode } from "./permissions";
import { ROLE_DEFINITIONS, type RoleCode } from "./roles";

/** Resolve the effective permission set for a set of roles. */
export function permissionsForRoles(roleCodes: readonly RoleCode[]): PermissionCode[] {
  const set = new Set<PermissionCode>();
  for (const code of roleCodes) {
    for (const permission of ROLE_DEFINITIONS[code].permissions) {
      set.add(permission);
    }
  }
  return [...set];
}

/**
 * Authorization check. A broader `.all` scope implies the matching `.own` scope
 * (e.g. `evaluations.read.all` satisfies a check for `evaluations.read.own`).
 */
export function hasPermission(
  granted: Iterable<PermissionCode>,
  required: PermissionCode,
): boolean {
  const set = granted instanceof Set ? granted : new Set<PermissionCode>(granted);
  if (set.has(required)) return true;
  if (required.endsWith(".own")) {
    const broader = `${required.slice(0, -".own".length)}.all` as PermissionCode;
    if (set.has(broader)) return true;
  }
  return false;
}

/** True if the grant set satisfies ANY of the required permissions. */
export function hasAnyPermission(
  granted: Iterable<PermissionCode>,
  required: readonly PermissionCode[],
): boolean {
  const set = granted instanceof Set ? granted : new Set<PermissionCode>(granted);
  return required.some((code) => hasPermission(set, code));
}
