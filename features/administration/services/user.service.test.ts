import { describe, it, expect } from "vitest";
import { EventBus } from "@/lib/events";
import { ROLES } from "@/lib/auth";
import { UserService } from "./user.service";
import { InMemoryUserRepository } from "../repositories/user.repository";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const DIRECTOR_ID = "00000000-0000-0000-0000-000000000002";
const PURCHASER_ID = "00000000-0000-0000-0000-000000000003";

function makeService(bus = new EventBus()) {
  return new UserService(new InMemoryUserRepository(), bus);
}

describe("UserService", () => {
  it("rejects assigning zero roles to an active user (≥1 role invariant)", async () => {
    const result = await makeService().assignRoles(DIRECTOR_ID, []);
    expect(result.ok).toBe(false);
  });

  it("assigns roles and publishes UserRoleAssigned", async () => {
    const bus = new EventBus();
    const events: string[] = [];
    bus.subscribe("UserRoleAssigned", (event) => {
      events.push(event.name);
    });
    const result = await makeService(bus).assignRoles(DIRECTOR_ID, [ROLES.PURCHASER]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.roleCodes).toEqual([ROLES.PURCHASER]);
    expect(events).toContain("UserRoleAssigned");
  });

  it("preserves the last active administrator", async () => {
    const result = await makeService().deactivate(ADMIN_ID);
    expect(result.ok).toBe(false);
  });

  it("deactivates a non-admin user", async () => {
    const result = await makeService().deactivate(PURCHASER_ID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe("INACTIVE");
  });

  it("returns not_found for an unknown user", async () => {
    const result = await makeService().deactivate("unknown-id");
    expect(result.ok).toBe(false);
  });
});
