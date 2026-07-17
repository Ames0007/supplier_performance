import { describe, it, expect } from "vitest";
import { ROLES } from "@/lib/auth";
import type { UserEntity } from "@/features/administration";
import { resolveSessionFromIdentity } from "./session.service";

const identity = { subjectId: "sub-1", email: "x@um6p.ma", displayName: "X" };

function user(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: "u1",
    email: "x@um6p.ma",
    displayName: "X",
    jobTitle: null,
    departmentIds: ["d1"],
    campusIds: ["c1"],
    roleCodes: [ROLES.PURCHASER],
    status: "ACTIVE",
    lastLoginAt: null,
    identityRef: "sub-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveSessionFromIdentity", () => {
  it("builds a session with resolved permissions + scope for an active user", async () => {
    const session = await resolveSessionFromIdentity(identity, { provision: async () => user() });
    expect(session).not.toBeNull();
    expect(session?.id).toBe("u1");
    expect(session?.permissions).toContain("suppliers.read");
    expect(session?.permissions).not.toContain("admin.users.manage");
    expect(session?.scope.campusIds).toEqual(["c1"]);
    expect(session?.scope.departmentIds).toEqual(["d1"]);
  });

  it("returns null for an inactive user (fail-closed)", async () => {
    const session = await resolveSessionFromIdentity(identity, {
      provision: async () => user({ status: "INACTIVE" }),
    });
    expect(session).toBeNull();
  });

  it("returns null when the identity cannot be provisioned", async () => {
    const session = await resolveSessionFromIdentity(identity, { provision: async () => null });
    expect(session).toBeNull();
  });
});
