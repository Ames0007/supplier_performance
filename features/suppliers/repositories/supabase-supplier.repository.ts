import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import {
  SUPPLIER_LIFECYCLE,
  SUPPLIER_SOURCE,
  type Supplier,
  type SupplierCategory,
  type SupplierContact,
  type SupplierDocument,
  type SupplierFilter,
  type SupplierLifecycleStatus,
  type SupplierOverlay,
  type SupplierSource,
  type SupplierTier,
} from "../types/supplier";
import type { SupplierRepository } from "./supplier.repository";

/**
 * Production supplier persistence backed by Supabase (tables in
 * database/migrations/0003). RLS is enforced by the database; this repository
 * uses the request client (never the service-role key).
 */
interface SupplierRow {
  id: string;
  sap_ref: string | null;
  code: string;
  name: string;
  legal_name: string | null;
  category_id: string | null;
  campus_id: string | null;
  country: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  lifecycle_status: string;
  tier: string | null;
  overlays: string[] | null;
  classification_effective_at: string;
  owner_user_id: string | null;
  source: string;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function toSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    sapRef: row.sap_ref,
    code: row.code,
    name: row.name,
    legalName: row.legal_name,
    categoryId: row.category_id,
    campusId: row.campus_id,
    country: row.country,
    city: row.city,
    email: row.email,
    phone: row.phone,
    taxId: row.tax_id,
    lifecycleStatus: (row.lifecycle_status as SupplierLifecycleStatus) ?? SUPPLIER_LIFECYCLE.PROSPECT,
    classification: {
      tier: (row.tier as SupplierTier | null) ?? null,
      overlays: (row.overlays as SupplierOverlay[] | null) ?? [],
      effectiveAt: row.classification_effective_at,
    },
    ownerUserId: row.owner_user_id,
    source: (row.source as SupplierSource) ?? SUPPLIER_SOURCE.MANUAL,
    blockedReason: row.blocked_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function toRow(supplier: Supplier): SupplierRow {
  return {
    id: supplier.id,
    sap_ref: supplier.sapRef,
    code: supplier.code,
    name: supplier.name,
    legal_name: supplier.legalName,
    category_id: supplier.categoryId,
    campus_id: supplier.campusId,
    country: supplier.country,
    city: supplier.city,
    email: supplier.email,
    phone: supplier.phone,
    tax_id: supplier.taxId,
    lifecycle_status: supplier.lifecycleStatus,
    tier: supplier.classification.tier,
    overlays: supplier.classification.overlays,
    classification_effective_at: supplier.classification.effectiveAt,
    owner_user_id: supplier.ownerUserId,
    source: supplier.source,
    blocked_reason: supplier.blockedReason,
    created_at: supplier.createdAt,
    updated_at: supplier.updatedAt,
    deleted_at: supplier.deletedAt,
  };
}

export class SupabaseSupplierRepository implements SupplierRepository {
  async list(filter?: SupplierFilter): Promise<Supplier[]> {
    const supabase = await createServerSupabase();
    let query = supabase
      .from("suppliers")
      .select("*")
      .is("deleted_at", null)
      .order("name", { ascending: true });
    if (filter?.status) query = query.eq("lifecycle_status", filter.status);
    if (filter?.tier) query = query.eq("tier", filter.tier);
    if (filter?.categoryId) query = query.eq("category_id", filter.categoryId);
    if (filter?.campusId) query = query.eq("campus_id", filter.campusId);
    if (filter?.ownerUserId) query = query.eq("owner_user_id", filter.ownerUserId);
    if (filter?.search) query = query.or(`name.ilike.%${filter.search}%,code.ilike.%${filter.search}%`);
    const { data, error } = await query;
    if (error) throw AppError.internal("Supplier list failed.", error);
    return ((data ?? []) as SupplierRow[]).map(toSupplier);
  }

  async findById(id: string): Promise<Supplier | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw AppError.internal("Supplier lookup failed.", error);
    return data ? toSupplier(data as SupplierRow) : null;
  }

  async findByCode(code: string): Promise<Supplier | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .ilike("code", code)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw AppError.internal("Supplier lookup failed.", error);
    return data ? toSupplier(data as SupplierRow) : null;
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("suppliers").upsert(toRow(supplier));
    if (error) throw AppError.internal("Supplier save failed.", error);
    return supplier;
  }

  async listContacts(supplierId: string): Promise<SupplierContact[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("supplier_contacts")
      .select("*")
      .eq("supplier_id", supplierId);
    if (error) throw AppError.internal("Contact list failed.", error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      supplierId: row.supplier_id as string,
      kind: row.kind as SupplierContact["kind"],
      name: row.name as string,
      role: (row.role as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      isPrimary: Boolean(row.is_primary),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  }

  async saveContact(contact: SupplierContact): Promise<SupplierContact> {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("supplier_contacts").upsert({
      id: contact.id,
      supplier_id: contact.supplierId,
      kind: contact.kind,
      name: contact.name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone,
      is_primary: contact.isPrimary,
      created_at: contact.createdAt,
      updated_at: contact.updatedAt,
    });
    if (error) throw AppError.internal("Contact save failed.", error);
    return contact;
  }

  async deleteContact(supplierId: string, contactId: string): Promise<void> {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("supplier_contacts")
      .delete()
      .eq("id", contactId)
      .eq("supplier_id", supplierId);
    if (error) throw AppError.internal("Contact delete failed.", error);
  }

  async listDocuments(supplierId: string): Promise<SupplierDocument[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("supplier_documents")
      .select("*")
      .eq("supplier_id", supplierId);
    if (error) throw AppError.internal("Document list failed.", error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      supplierId: row.supplier_id as string,
      name: row.name as string,
      docType: row.doc_type as string,
      url: (row.url as string | null) ?? null,
      uploadedById: (row.uploaded_by_id as string | null) ?? null,
      uploadedByName: row.uploaded_by_name as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  }

  async saveDocument(document: SupplierDocument): Promise<SupplierDocument> {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("supplier_documents").upsert({
      id: document.id,
      supplier_id: document.supplierId,
      name: document.name,
      doc_type: document.docType,
      url: document.url,
      uploaded_by_id: document.uploadedById,
      uploaded_by_name: document.uploadedByName,
      created_at: document.createdAt,
      updated_at: document.updatedAt,
    });
    if (error) throw AppError.internal("Document save failed.", error);
    return document;
  }

  async deleteDocument(supplierId: string, documentId: string): Promise<void> {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("supplier_documents")
      .delete()
      .eq("id", documentId)
      .eq("supplier_id", supplierId);
    if (error) throw AppError.internal("Document delete failed.", error);
  }

  async listCategories(): Promise<SupplierCategory[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("supplier_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw AppError.internal("Category list failed.", error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      code: row.code as string,
      name: row.name as string,
    }));
  }

  async findCategory(id: string): Promise<SupplierCategory | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("supplier_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw AppError.internal("Category lookup failed.", error);
    return data ? { id: data.id as string, code: data.code as string, name: data.name as string } : null;
  }
}
