import { describe, it, expect, afterEach } from "vitest";
import {
  buildSession,
  requirePermission,
  requireSession,
  setSessionResolver,
  PERMISSIONS,
  ROLES,
} from "./index";

const adminSession = buildSession({
  id: "u1",
  email: "admin@um6p.ma",
  displayName: "Admin",
  roleCodes: [ROLES.SUPER_ADMIN],
});
const viewerSession = buildSession({
  id: "u2",
  email: "viewer@um6p.ma",
  displayName: "Viewer",
  roleCodes: [ROLES.VIEWER],
});

afterEach(() => setSessionResolver(async () => null));

describe("auth guards", () => {
  it("requireSession rejects when there is no session (fail-closed default)", async () => {
    setSessionResolver(async () => null);
    await expect(requireSession()).rejects.toThrow();
  });

  it("requirePermission returns the session for an authorized user", async () => {
    setSessionResolver(async () => adminSession);
    await expect(requirePermission(PERMISSIONS.ADMIN_USERS_MANAGE)).resolves.toMatchObject({
      id: "u1",
    });
  });

  it("requirePermission rejects (forbidden) for an authenticated but unauthorized user", async () => {
    setSessionResolver(async () => viewerSession);
    await expect(requirePermission(PERMISSIONS.ADMIN_USERS_MANAGE)).rejects.toThrow();
  });
});
