import {
  SUPPLIER_LIFECYCLE,
  SUPPLIER_SOURCE,
  SUPPLIER_TIER,
  type Supplier,
  type SupplierCategory,
  type SupplierContact,
  type SupplierDocument,
  type SupplierFilter,
} from "../types/supplier";

/**
 * Persistence port for the Supplier aggregate. Two implementations sit behind
 * this interface: InMemorySupplierRepository (dev/test/fallback — here) and
 * SupabaseSupplierRepository (production). Selected at the composition root.
 */
export interface SupplierRepository {
  list(filter?: SupplierFilter): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  findByCode(code: string): Promise<Supplier | null>;
  save(supplier: Supplier): Promise<Supplier>;

  listContacts(supplierId: string): Promise<SupplierContact[]>;
  saveContact(contact: SupplierContact): Promise<SupplierContact>;
  deleteContact(supplierId: string, contactId: string): Promise<void>;

  listDocuments(supplierId: string): Promise<SupplierDocument[]>;
  saveDocument(document: SupplierDocument): Promise<SupplierDocument>;
  deleteDocument(supplierId: string, documentId: string): Promise<void>;

  listCategories(): Promise<SupplierCategory[]>;
  findCategory(id: string): Promise<SupplierCategory | null>;
}

const NOW = "2026-02-01T09:00:00.000Z";
const ADMIN_ID = "00000000-0000-0000-0000-000000000001";

const SEED_CATEGORIES: SupplierCategory[] = [
  { id: "c0000000-0000-0000-0000-000000000001", code: "IT", name: "Équipements informatiques" },
  { id: "c0000000-0000-0000-0000-000000000002", code: "LAB", name: "Équipements de laboratoire" },
  { id: "c0000000-0000-0000-0000-000000000003", code: "WORKS", name: "Travaux" },
  { id: "c0000000-0000-0000-0000-000000000004", code: "SERVICES", name: "Prestations de services" },
  { id: "c0000000-0000-0000-0000-000000000005", code: "CONSUM", name: "Consommables" },
];

function classification(
  tier: Supplier["classification"]["tier"],
): Supplier["classification"] {
  return { tier, overlays: [], effectiveAt: NOW };
}

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "50000000-0000-0000-0000-000000000001",
    sapRef: null,
    code: "SUP-1001",
    name: "ACME Laboratoires",
    legalName: "ACME Laboratoires SARL",
    categoryId: SEED_CATEGORIES[1]!.id,
    campusId: null,
    country: "Maroc",
    city: "Benguerir",
    email: "contact@acme-labs.ma",
    phone: "+212 5 25 00 00 01",
    taxId: "IF-1001",
    lifecycleStatus: SUPPLIER_LIFECYCLE.STRATEGIC,
    classification: classification(SUPPLIER_TIER.STRATEGIC),
    ownerUserId: ADMIN_ID,
    source: SUPPLIER_SOURCE.MANUAL,
    blockedReason: null,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: "50000000-0000-0000-0000-000000000002",
    sapRef: null,
    code: "SUP-1002",
    name: "NovaTech Systems",
    legalName: "NovaTech Systems SA",
    categoryId: SEED_CATEGORIES[0]!.id,
    campusId: null,
    country: "Maroc",
    city: "Rabat",
    email: "sales@novatech.ma",
    phone: "+212 5 37 00 00 02",
    taxId: "IF-1002",
    lifecycleStatus: SUPPLIER_LIFECYCLE.PREFERRED,
    classification: classification(SUPPLIER_TIER.PREFERRED),
    ownerUserId: ADMIN_ID,
    source: SUPPLIER_SOURCE.MANUAL,
    blockedReason: null,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: "50000000-0000-0000-0000-000000000003",
    sapRef: null,
    code: "SUP-1003",
    name: "BuildCo Travaux",
    legalName: "BuildCo Travaux SARL",
    categoryId: SEED_CATEGORIES[2]!.id,
    campusId: null,
    country: "Maroc",
    city: "Casablanca",
    email: "info@buildco.ma",
    phone: "+212 5 22 00 00 03",
    taxId: "IF-1003",
    lifecycleStatus: SUPPLIER_LIFECYCLE.APPROVED,
    classification: classification(SUPPLIER_TIER.APPROVED),
    ownerUserId: null,
    source: SUPPLIER_SOURCE.MANUAL,
    blockedReason: null,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: "50000000-0000-0000-0000-000000000004",
    sapRef: null,
    code: "SUP-1004",
    name: "Global Office Supplies",
    legalName: null,
    categoryId: SEED_CATEGORIES[4]!.id,
    campusId: null,
    country: "Maroc",
    city: "Marrakech",
    email: null,
    phone: null,
    taxId: null,
    lifecycleStatus: SUPPLIER_LIFECYCLE.PROSPECT,
    classification: classification(SUPPLIER_TIER.TRANSACTIONAL),
    ownerUserId: null,
    source: SUPPLIER_SOURCE.MANUAL,
    blockedReason: null,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
];

const SEED_CONTACTS: SupplierContact[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    supplierId: SEED_SUPPLIERS[0]!.id,
    kind: "SUPPLIER",
    name: "Sara Benali",
    role: "Responsable commercial",
    email: "s.benali@acme-labs.ma",
    phone: "+212 6 00 00 00 01",
    isPrimary: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const SEED_DOCUMENTS: SupplierDocument[] = [
  {
    id: "70000000-0000-0000-0000-000000000001",
    supplierId: SEED_SUPPLIERS[0]!.id,
    name: "Attestation fiscale 2026",
    docType: "certificate",
    url: null,
    uploadedById: ADMIN_ID,
    uploadedByName: "Administrateur SPM",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export class InMemorySupplierRepository implements SupplierRepository {
  private readonly suppliers: Map<string, Supplier>;
  private readonly contacts: SupplierContact[];
  private readonly documents: SupplierDocument[];
  private readonly categories: SupplierCategory[];

  constructor(seed?: {
    suppliers?: readonly Supplier[];
    contacts?: readonly SupplierContact[];
    documents?: readonly SupplierDocument[];
    categories?: readonly SupplierCategory[];
  }) {
    this.suppliers = new Map((seed?.suppliers ?? SEED_SUPPLIERS).map((s) => [s.id, s]));
    this.contacts = [...(seed?.contacts ?? SEED_CONTACTS)];
    this.documents = [...(seed?.documents ?? SEED_DOCUMENTS)];
    this.categories = [...(seed?.categories ?? SEED_CATEGORIES)];
  }

  async list(filter?: SupplierFilter): Promise<Supplier[]> {
    let result = [...this.suppliers.values()].filter((s) => s.deletedAt === null);
    if (filter?.search) {
      const needle = filter.search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(needle) || s.code.toLowerCase().includes(needle),
      );
    }
    if (filter?.status) result = result.filter((s) => s.lifecycleStatus === filter.status);
    if (filter?.tier) result = result.filter((s) => s.classification.tier === filter.tier);
    if (filter?.categoryId) result = result.filter((s) => s.categoryId === filter.categoryId);
    if (filter?.campusId) result = result.filter((s) => s.campusId === filter.campusId);
    if (filter?.ownerUserId) result = result.filter((s) => s.ownerUserId === filter.ownerUserId);
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Supplier | null> {
    const supplier = this.suppliers.get(id);
    return supplier && supplier.deletedAt === null ? supplier : null;
  }

  async findByCode(code: string): Promise<Supplier | null> {
    const needle = code.toLowerCase();
    return (
      [...this.suppliers.values()].find(
        (s) => s.code.toLowerCase() === needle && s.deletedAt === null,
      ) ?? null
    );
  }

  async save(supplier: Supplier): Promise<Supplier> {
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  async listContacts(supplierId: string): Promise<SupplierContact[]> {
    return this.contacts.filter((c) => c.supplierId === supplierId);
  }

  async saveContact(contact: SupplierContact): Promise<SupplierContact> {
    const index = this.contacts.findIndex((c) => c.id === contact.id);
    if (index >= 0) this.contacts[index] = contact;
    else this.contacts.push(contact);
    return contact;
  }

  async deleteContact(supplierId: string, contactId: string): Promise<void> {
    const index = this.contacts.findIndex((c) => c.id === contactId && c.supplierId === supplierId);
    if (index >= 0) this.contacts.splice(index, 1);
  }

  async listDocuments(supplierId: string): Promise<SupplierDocument[]> {
    return this.documents.filter((d) => d.supplierId === supplierId);
  }

  async saveDocument(document: SupplierDocument): Promise<SupplierDocument> {
    const index = this.documents.findIndex((d) => d.id === document.id);
    if (index >= 0) this.documents[index] = document;
    else this.documents.push(document);
    return document;
  }

  async deleteDocument(supplierId: string, documentId: string): Promise<void> {
    const index = this.documents.findIndex(
      (d) => d.id === documentId && d.supplierId === supplierId,
    );
    if (index >= 0) this.documents.splice(index, 1);
  }

  async listCategories(): Promise<SupplierCategory[]> {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findCategory(id: string): Promise<SupplierCategory | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }
}

/**
 * Shared in-memory instance so the command service and query service observe the
 * SAME store at runtime (dev/test fallback). The composition root swaps both
 * onto a single Supabase repository in production.
 */
export const inMemorySupplierRepository = new InMemorySupplierRepository();
