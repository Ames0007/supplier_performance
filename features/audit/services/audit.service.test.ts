import { describe, it, expect } from "vitest";
import { EventBus, createEvent } from "@/lib/events";
import { AuditService } from "./audit.service";
import { registerAuditSubscribers } from "./audit-subscriptions";
import { InMemoryAuditRepository } from "../repositories/audit.repository";

describe("AuditService", () => {
  it("stamps standard fields and appends an immutable record", async () => {
    const service = new AuditService(new InMemoryAuditRepository([]));
    const record = await service.record({ actorName: "Test", action: "x.y", entityType: "z" });
    expect(record.id).toBeTruthy();
    expect(record.actorType).toBe("USER");
    expect(record.createdAt).toBeTruthy();
    expect(await service.list()).toHaveLength(1);
  });

  it("lists records newest-first", async () => {
    const service = new AuditService();
    const before = await service.list();
    const record = await service.record({
      actorName: "Test",
      action: "user.deactivated",
      entityType: "user",
    });
    const after = await service.list();
    expect(after.length).toBe(before.length + 1);
    expect(after[0]?.id).toBe(record.id);
  });

  it("records an audit entry when a UserRoleAssigned event is published", async () => {
    const bus = new EventBus();
    const service = new AuditService(new InMemoryAuditRepository([]));
    registerAuditSubscribers(bus, service);
    await bus.publish(createEvent("UserRoleAssigned", { userId: "u1", roleCodes: ["PURCHASER"] }));
    const records = await service.list();
    expect(records.some((r) => r.action === "user.role_assigned")).toBe(true);
  });
});
