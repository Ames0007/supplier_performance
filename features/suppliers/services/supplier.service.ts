import { AppError, err, ok, type Result } from "@/lib/errors";
import { EventBus, eventBus, createEvent } from "@/lib/events";
import type { Id } from "@/types";
import {
  SUPPLIER_LIFECYCLE,
  SUPPLIER_SOURCE,
  type Supplier,
  type SupplierContact,
  type SupplierDocument,
  type SupplierTier,
} from "../types/supplier";
import { SUPPLIER_EVENTS, type SupplierEventName } from "../constants/supplier-events";
import { nextLifecycleStatus, type SupplierTransition } from "./supplier-lifecycle";
import {
  inMemorySupplierRepository,
  type SupplierRepository,
} from "../repositories/supplier.repository";
import type {
  CreateSupplierInput,
  SupplierContactInput,
  SupplierDocumentInput,
  UpdateSupplierInput,
} from "../schemas/supplier.schema";

/** The user performing a command (for real-actor audit). */
export interface SupplierActor {
  readonly id: Id;
  readonly name: string;
}

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Supplier aggregate service (commands). Every command enforces aggregate
 * invariants, persists through the repository, and publishes a domain event
 * carrying the real actor — the Audit context records it via subscriptions.
 */
export class SupplierService {
  constructor(
    private repo: SupplierRepository,
    private readonly bus: EventBus = eventBus,
  ) {}

  /** Composition-root swap to the production (Supabase) repository. */
  setRepository(repo: SupplierRepository): void {
    this.repo = repo;
  }

  async create(input: CreateSupplierInput, actor: SupplierActor): Promise<Result<Supplier>> {
    const code = input.code.trim();
    if (await this.repo.findByCode(code)) {
      return err(AppError.conflict("Un fournisseur avec ce code existe déjà."));
    }
    const now = new Date().toISOString();
    const supplier: Supplier = {
      id: crypto.randomUUID(),
      sapRef: null,
      code,
      name: input.name.trim(),
      legalName: clean(input.legalName),
      categoryId: input.categoryId ?? null,
      campusId: input.campusId ?? null,
      country: clean(input.country),
      city: clean(input.city),
      email: clean(input.email),
      phone: clean(input.phone),
      taxId: clean(input.taxId),
      lifecycleStatus: SUPPLIER_LIFECYCLE.PROSPECT,
      classification: { tier: null, overlays: [], effectiveAt: now },
      ownerUserId: input.ownerUserId ?? null,
      source: SUPPLIER_SOURCE.MANUAL,
      blockedReason: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.repo.save(supplier);
    await this.publish(SUPPLIER_EVENTS.CREATED, supplier, actor, {
      code: supplier.code,
      name: supplier.name,
    });
    return ok(supplier);
  }

  async update(input: UpdateSupplierInput, actor: SupplierActor): Promise<Result<Supplier>> {
    const current = await this.repo.findById(input.id);
    if (!current) return err(AppError.notFound("Fournisseur introuvable."));
    const updated: Supplier = {
      ...current,
      name: input.name?.trim() ?? current.name,
      legalName: input.legalName !== undefined ? clean(input.legalName) : current.legalName,
      categoryId: input.categoryId !== undefined ? (input.categoryId ?? null) : current.categoryId,
      campusId: input.campusId !== undefined ? (input.campusId ?? null) : current.campusId,
      country: input.country !== undefined ? clean(input.country) : current.country,
      city: input.city !== undefined ? clean(input.city) : current.city,
      email: input.email !== undefined ? clean(input.email) : current.email,
      phone: input.phone !== undefined ? clean(input.phone) : current.phone,
      taxId: input.taxId !== undefined ? clean(input.taxId) : current.taxId,
      ownerUserId: input.ownerUserId !== undefined ? (input.ownerUserId ?? null) : current.ownerUserId,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.save(updated);
    await this.publish(SUPPLIER_EVENTS.UPDATED, updated, actor, {});
    return ok(updated);
  }

  approve(id: string, actor: SupplierActor): Promise<Result<Supplier>> {
    return this.transition(id, "approve", SUPPLIER_EVENTS.APPROVED, actor);
  }

  block(id: string, reason: string, actor: SupplierActor): Promise<Result<Supplier>> {
    return this.transition(id, "block", SUPPLIER_EVENTS.BLOCKED, actor, reason);
  }

  unblock(id: string, actor: SupplierActor): Promise<Result<Supplier>> {
    return this.transition(id, "unblock", SUPPLIER_EVENTS.UNBLOCKED, actor);
  }

  archive(id: string, actor: SupplierActor): Promise<Result<Supplier>> {
    return this.transition(id, "archive", SUPPLIER_EVENTS.ARCHIVED, actor);
  }

  reactivate(id: string, actor: SupplierActor): Promise<Result<Supplier>> {
    return this.transition(id, "reactivate", SUPPLIER_EVENTS.REACTIVATED, actor);
  }

  async reclassify(id: string, tier: SupplierTier, actor: SupplierActor): Promise<Result<Supplier>> {
    const current = await this.repo.findById(id);
    if (!current) return err(AppError.notFound("Fournisseur introuvable."));
    const now = new Date().toISOString();
    const updated: Supplier = {
      ...current,
      classification: { tier, overlays: current.classification.overlays, effectiveAt: now },
      updatedAt: now,
    };
    await this.repo.save(updated);
    await this.publish(SUPPLIER_EVENTS.RECLASSIFIED, updated, actor, { tier });
    return ok(updated);
  }

  async addContact(input: SupplierContactInput, actor: SupplierActor): Promise<Result<SupplierContact>> {
    const supplier = await this.repo.findById(input.supplierId);
    if (!supplier) return err(AppError.notFound("Fournisseur introuvable."));
    const now = new Date().toISOString();
    const contact: SupplierContact = {
      id: crypto.randomUUID(),
      supplierId: input.supplierId,
      kind: input.kind,
      name: input.name.trim(),
      role: clean(input.role),
      email: clean(input.email),
      phone: clean(input.phone),
      isPrimary: input.isPrimary ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.saveContact(contact);
    await this.publish(SUPPLIER_EVENTS.CONTACT_ADDED, supplier, actor, {
      contactId: contact.id,
      name: contact.name,
    });
    return ok(contact);
  }

  async removeContact(supplierId: string, contactId: string, actor: SupplierActor): Promise<Result<null>> {
    const supplier = await this.repo.findById(supplierId);
    if (!supplier) return err(AppError.notFound("Fournisseur introuvable."));
    await this.repo.deleteContact(supplierId, contactId);
    await this.publish(SUPPLIER_EVENTS.CONTACT_REMOVED, supplier, actor, { contactId });
    return ok(null);
  }

  async addDocument(input: SupplierDocumentInput, actor: SupplierActor): Promise<Result<SupplierDocument>> {
    const supplier = await this.repo.findById(input.supplierId);
    if (!supplier) return err(AppError.notFound("Fournisseur introuvable."));
    const now = new Date().toISOString();
    const document: SupplierDocument = {
      id: crypto.randomUUID(),
      supplierId: input.supplierId,
      name: input.name.trim(),
      docType: input.docType.trim(),
      url: clean(input.url),
      uploadedById: actor.id,
      uploadedByName: actor.name,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.saveDocument(document);
    await this.publish(SUPPLIER_EVENTS.DOCUMENT_ADDED, supplier, actor, {
      documentId: document.id,
      name: document.name,
    });
    return ok(document);
  }

  async removeDocument(supplierId: string, documentId: string, actor: SupplierActor): Promise<Result<null>> {
    const supplier = await this.repo.findById(supplierId);
    if (!supplier) return err(AppError.notFound("Fournisseur introuvable."));
    await this.repo.deleteDocument(supplierId, documentId);
    await this.publish(SUPPLIER_EVENTS.DOCUMENT_REMOVED, supplier, actor, { documentId });
    return ok(null);
  }

  private async transition(
    id: string,
    transition: SupplierTransition,
    event: SupplierEventName,
    actor: SupplierActor,
    reason?: string,
  ): Promise<Result<Supplier>> {
    const current = await this.repo.findById(id);
    if (!current) return err(AppError.notFound("Fournisseur introuvable."));
    const next = nextLifecycleStatus(current.lifecycleStatus, transition);
    if (!next) {
      return err(
        AppError.conflict(`Transition non permise depuis l'état « ${current.lifecycleStatus} ».`),
      );
    }
    const updated: Supplier = {
      ...current,
      lifecycleStatus: next,
      blockedReason:
        transition === "block"
          ? (reason ?? null)
          : next === SUPPLIER_LIFECYCLE.APPROVED
            ? null
            : current.blockedReason,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.save(updated);
    await this.publish(event, updated, actor, reason ? { reason } : {});
    return ok(updated);
  }

  private publish(
    name: SupplierEventName,
    supplier: Supplier,
    actor: SupplierActor,
    context: Record<string, unknown>,
  ): Promise<void> {
    return this.bus.publish(
      createEvent(name, {
        supplierId: supplier.id,
        supplierName: supplier.name,
        actorId: actor.id,
        actorName: actor.name,
        ...context,
      }),
    );
  }
}

/**
 * Default singleton uses the in-memory repository (dev/test/fallback). In
 * production the composition root swaps in the Supabase repository via
 * configureSupplierPersistence().
 */
export const supplierService = new SupplierService(inMemorySupplierRepository);
