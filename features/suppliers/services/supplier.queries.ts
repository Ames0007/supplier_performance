import { hasPermission, PERMISSIONS, type SessionUser } from "@/lib/auth";
import { auditService, type AuditRecord } from "@/features/audit";
import {
  type Supplier,
  type SupplierCategory,
  type SupplierDetail,
  type SupplierFilter,
  type SupplierListItem,
  type SupplierTimelineEvent,
} from "../types/supplier";
import {
  inMemorySupplierRepository,
  type SupplierRepository,
} from "../repositories/supplier.repository";

const TIMELINE_LABELS: Record<string, string> = {
  "supplier.created": "Fournisseur créé",
  "supplier.updated": "Informations mises à jour",
  "supplier.approved": "Fournisseur approuvé",
  "supplier.blocked": "Fournisseur bloqué",
  "supplier.unblocked": "Fournisseur débloqué",
  "supplier.archived": "Fournisseur archivé",
  "supplier.reactivated": "Fournisseur réactivé",
  "supplier.reclassified": "Segment (tier) modifié",
  "supplier.contact_added": "Contact ajouté",
  "supplier.contact_removed": "Contact supprimé",
  "supplier.document_added": "Document ajouté",
  "supplier.document_removed": "Document supprimé",
};

function toListItem(supplier: Supplier): SupplierListItem {
  return {
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    categoryId: supplier.categoryId,
    campusId: supplier.campusId,
    lifecycleStatus: supplier.lifecycleStatus,
    tier: supplier.classification.tier,
    overlays: supplier.classification.overlays,
    ownerUserId: supplier.ownerUserId,
    updatedAt: supplier.updatedAt,
  };
}

function summarize(record: AuditRecord): string {
  const label = TIMELINE_LABELS[record.action] ?? record.action;
  return record.reason ? `${label} — ${record.reason}` : label;
}

/**
 * Supplier read model (queries). Scope-aware per RBAC: `suppliers.read.all`
 * sees every supplier; `suppliers.read` sees only suppliers they own (relationship
 * owner). RLS enforces the same at the database layer.
 */
export class SupplierQueries {
  constructor(private repo: SupplierRepository) {}

  setRepository(repo: SupplierRepository): void {
    this.repo = repo;
  }

  private canReadAll(viewer: SessionUser): boolean {
    return hasPermission(viewer.permissions, PERMISSIONS.SUPPLIERS_READ_ALL);
  }

  private canView(viewer: SessionUser, supplier: Supplier): boolean {
    return this.canReadAll(viewer) || supplier.ownerUserId === viewer.id;
  }

  async list(viewer: SessionUser, filter: SupplierFilter = {}): Promise<SupplierListItem[]> {
    const scoped: SupplierFilter = this.canReadAll(viewer)
      ? filter
      : { ...filter, ownerUserId: viewer.id };
    const suppliers = await this.repo.list(scoped);
    return suppliers.map(toListItem);
  }

  async getDetail(viewer: SessionUser, id: string): Promise<SupplierDetail | null> {
    const supplier = await this.repo.findById(id);
    if (!supplier || !this.canView(viewer, supplier)) return null;
    const [category, contacts, documents] = await Promise.all([
      supplier.categoryId ? this.repo.findCategory(supplier.categoryId) : Promise.resolve(null),
      this.repo.listContacts(id),
      this.repo.listDocuments(id),
    ]);
    return { supplier, category, contacts, documents };
  }

  async getTimeline(viewer: SessionUser, id: string): Promise<SupplierTimelineEvent[]> {
    const supplier = await this.repo.findById(id);
    if (!supplier || !this.canView(viewer, supplier)) return [];
    const records = await auditService.list({ entityType: "supplier", entityId: id });
    return records.map((record) => ({
      id: record.id,
      at: record.createdAt,
      action: record.action,
      actorName: record.actorName,
      summary: summarize(record),
    }));
  }

  listCategories(): Promise<SupplierCategory[]> {
    return this.repo.listCategories();
  }
}

export const supplierQueries = new SupplierQueries(inMemorySupplierRepository);
