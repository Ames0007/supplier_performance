import { describe, it, expect } from "vitest";
import { EventBus } from "@/lib/events";
import { SupplierService, type SupplierActor } from "./supplier.service";
import { InMemorySupplierRepository } from "../repositories/supplier.repository";
import { SUPPLIER_EVENTS } from "../constants/supplier-events";
import { SUPPLIER_LIFECYCLE, SUPPLIER_TIER } from "../types/supplier";

const ACTOR: SupplierActor = { id: "admin-1", name: "Administrateur" };
const PROSPECT_ID = "50000000-0000-0000-0000-000000000004"; // Global Office Supplies
const STRATEGIC_ID = "50000000-0000-0000-0000-000000000001"; // ACME (STRATEGIC, owner admin)

function make() {
  const bus = new EventBus();
  const events: string[] = [];
  for (const name of Object.values(SUPPLIER_EVENTS)) {
    bus.subscribe(name, (event) => {
      events.push(event.name);
    });
  }
  return { service: new SupplierService(new InMemorySupplierRepository(), bus), events };
}

describe("SupplierService", () => {
  it("creates a supplier as PROSPECT and publishes SupplierCreated", async () => {
    const { service, events } = make();
    const result = await service.create({ code: "SUP-NEW", name: "Nouveau Fournisseur" }, ACTOR);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.PROSPECT);
      expect(result.value.source).toBe("MANUAL");
    }
    expect(events).toContain(SUPPLIER_EVENTS.CREATED);
  });

  it("rejects a duplicate supplier code", async () => {
    const { service } = make();
    const result = await service.create({ code: "SUP-1001", name: "Doublon" }, ACTOR);
    expect(result.ok).toBe(false);
  });

  it("approves a PROSPECT and rejects approving a non-PROSPECT", async () => {
    const { service, events } = make();
    const approved = await service.approve(PROSPECT_ID, ACTOR);
    expect(approved.ok).toBe(true);
    if (approved.ok) expect(approved.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.APPROVED);
    expect(events).toContain(SUPPLIER_EVENTS.APPROVED);

    const invalid = await service.approve(STRATEGIC_ID, ACTOR);
    expect(invalid.ok).toBe(false);
  });

  it("blocks with a mandatory reason, then unblocks (clearing the reason)", async () => {
    const { service, events } = make();
    const blocked = await service.block(STRATEGIC_ID, "Manquements répétés", ACTOR);
    expect(blocked.ok).toBe(true);
    if (blocked.ok) {
      expect(blocked.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.BLOCKED);
      expect(blocked.value.blockedReason).toBe("Manquements répétés");
    }
    const unblocked = await service.unblock(STRATEGIC_ID, ACTOR);
    expect(unblocked.ok).toBe(true);
    if (unblocked.ok) {
      expect(unblocked.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.APPROVED);
      expect(unblocked.value.blockedReason).toBeNull();
    }
    expect(events).toContain(SUPPLIER_EVENTS.BLOCKED);
    expect(events).toContain(SUPPLIER_EVENTS.UNBLOCKED);
  });

  it("archives then reactivates, and refuses to archive twice", async () => {
    const { service } = make();
    const archived = await service.archive(STRATEGIC_ID, ACTOR);
    expect(archived.ok).toBe(true);
    if (archived.ok) expect(archived.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.ARCHIVED);

    const again = await service.archive(STRATEGIC_ID, ACTOR);
    expect(again.ok).toBe(false);

    const reactivated = await service.reactivate(STRATEGIC_ID, ACTOR);
    expect(reactivated.ok).toBe(true);
    if (reactivated.ok) expect(reactivated.value.lifecycleStatus).toBe(SUPPLIER_LIFECYCLE.APPROVED);
  });

  it("reclassifies the tier and publishes SupplierReclassified", async () => {
    const { service, events } = make();
    const result = await service.reclassify(STRATEGIC_ID, SUPPLIER_TIER.PREFERRED, ACTOR);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.classification.tier).toBe(SUPPLIER_TIER.PREFERRED);
    expect(events).toContain(SUPPLIER_EVENTS.RECLASSIFIED);
  });

  it("adds and removes a contact with domain events", async () => {
    const { service, events } = make();
    const added = await service.addContact(
      { supplierId: STRATEGIC_ID, kind: "SUPPLIER", name: "Contact Test", isPrimary: false },
      ACTOR,
    );
    expect(added.ok).toBe(true);
    if (added.ok) {
      const removed = await service.removeContact(STRATEGIC_ID, added.value.id, ACTOR);
      expect(removed.ok).toBe(true);
    }
    expect(events).toContain(SUPPLIER_EVENTS.CONTACT_ADDED);
    expect(events).toContain(SUPPLIER_EVENTS.CONTACT_REMOVED);
  });

  it("adds a document stamped with the real uploader", async () => {
    const { service, events } = make();
    const added = await service.addDocument(
      { supplierId: STRATEGIC_ID, name: "Attestation", docType: "certificate" },
      ACTOR,
    );
    expect(added.ok).toBe(true);
    if (added.ok) expect(added.value.uploadedByName).toBe("Administrateur");
    expect(events).toContain(SUPPLIER_EVENTS.DOCUMENT_ADDED);
  });
});
