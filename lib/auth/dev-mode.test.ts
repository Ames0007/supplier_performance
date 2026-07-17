import { describe, it, expect, vi, afterEach } from "vitest";
import { isPublicDemoMode, PUBLIC_DEMO_USER, PUBLIC_DEMO_BANNER_TEXT } from "./dev-mode";
import { ROLES } from "./roles";
import { permissionsForRoles } from "./rbac";
import { ALL_PERMISSIONS } from "./permissions";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public development mode flag", () => {
  it("is DISABLED by default (not development, flag unset)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_DEMO", "");
    expect(isPublicDemoMode()).toBe(false);
  });

  it("is ENABLED when NODE_ENV=development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_DEMO", "");
    expect(isPublicDemoMode()).toBe(true);
  });

  it("is ENABLED when NEXT_PUBLIC_PUBLIC_DEMO=true (even in production)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_DEMO", "true");
    expect(isPublicDemoMode()).toBe(true);
  });

  it("is DISABLED for non-'true' flag values in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const v of ["false", "", "1", "yes", "0"]) {
      vi.stubEnv("NEXT_PUBLIC_PUBLIC_DEMO", v);
      expect(isPublicDemoMode()).toBe(false);
    }
  });

  it("tolerates case and surrounding whitespace in the flag value", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const v of ["true", "True", "TRUE", " true", "true ", "  TrUe  "]) {
      vi.stubEnv("NEXT_PUBLIC_PUBLIC_DEMO", v);
      expect(isPublicDemoMode()).toBe(true);
    }
  });
});

describe("development user", () => {
  it("is the Development Administrator in Procurement with SUPER_ADMIN", () => {
    expect(PUBLIC_DEMO_USER.displayName).toBe("Development Administrator");
    expect(PUBLIC_DEMO_USER.department).toBe("Procurement");
    expect(PUBLIC_DEMO_USER.roleCodes).toEqual([ROLES.SUPER_ADMIN]);
  });

  it("resolves to ALL permissions (RBAC still applies; the demo user satisfies it)", () => {
    const perms = permissionsForRoles(PUBLIC_DEMO_USER.roleCodes);
    expect(perms).toEqual(expect.arrayContaining(ALL_PERMISSIONS));
    expect(perms.length).toBe(ALL_PERMISSIONS.length);
  });

  it("exposes the exact banner text required on every page", () => {
    expect(PUBLIC_DEMO_BANNER_TEXT).toBe("Public Development Mode – Authentication Disabled");
  });
});
