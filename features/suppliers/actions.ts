"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import { parse, z } from "@/lib/validation";
import { supplierService, type SupplierActor } from "./services/supplier.service";
import {
  blockSupplierSchema,
  classifySupplierSchema,
  createSupplierSchema,
  supplierContactSchema,
  supplierDocumentSchema,
  updateSupplierSchema,
} from "./schemas/supplier.schema";
import type { Result } from "@/lib/errors";

/** All supplier mutations require `suppliers.manage` (defence-in-depth + RLS). */
async function requireManager(): Promise<SupplierActor> {
  const session = await requirePermission(PERMISSIONS.SUPPLIERS_MANAGE);
  return { id: session.id, name: session.displayName };
}

function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw result.error;
  return result.value;
}

const idSchema = z.object({ id: z.string().uuid() });
const contactRefSchema = z.object({ supplierId: z.string().uuid(), contactId: z.string().uuid() });
const documentRefSchema = z.object({ supplierId: z.string().uuid(), documentId: z.string().uuid() });

export async function createSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(createSupplierSchema, {
    code: field(formData, "code"),
    name: field(formData, "name"),
    legalName: field(formData, "legalName"),
    categoryId: field(formData, "categoryId"),
    country: field(formData, "country"),
    city: field(formData, "city"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    taxId: field(formData, "taxId"),
  });
  const supplier = unwrap(await supplierService.create(input, actor));
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplier.id}`);
}

export async function updateSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(updateSupplierSchema, {
    id: field(formData, "id"),
    name: field(formData, "name"),
    legalName: field(formData, "legalName"),
    categoryId: field(formData, "categoryId"),
    country: field(formData, "country"),
    city: field(formData, "city"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    taxId: field(formData, "taxId"),
  });
  unwrap(await supplierService.update(input, actor));
  revalidatePath(`/suppliers/${input.id}`);
  redirect(`/suppliers/${input.id}`);
}

export async function approveSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { id } = parse(idSchema, { id: field(formData, "id") });
  unwrap(await supplierService.approve(id, actor));
  revalidatePath(`/suppliers/${id}`);
}

export async function blockSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(blockSupplierSchema, {
    id: field(formData, "id"),
    reason: field(formData, "reason"),
  });
  unwrap(await supplierService.block(input.id, input.reason, actor));
  revalidatePath(`/suppliers/${input.id}`);
}

export async function unblockSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { id } = parse(idSchema, { id: field(formData, "id") });
  unwrap(await supplierService.unblock(id, actor));
  revalidatePath(`/suppliers/${id}`);
}

export async function archiveSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { id } = parse(idSchema, { id: field(formData, "id") });
  unwrap(await supplierService.archive(id, actor));
  revalidatePath(`/suppliers/${id}`);
}

export async function reactivateSupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { id } = parse(idSchema, { id: field(formData, "id") });
  unwrap(await supplierService.reactivate(id, actor));
  revalidatePath(`/suppliers/${id}`);
}

export async function reclassifySupplierAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(classifySupplierSchema, {
    id: field(formData, "id"),
    tier: field(formData, "tier"),
  });
  unwrap(await supplierService.reclassify(input.id, input.tier, actor));
  revalidatePath(`/suppliers/${input.id}`);
}

export async function addContactAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(supplierContactSchema, {
    supplierId: field(formData, "supplierId"),
    kind: field(formData, "kind"),
    name: field(formData, "name"),
    role: field(formData, "role"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    isPrimary: formData.get("isPrimary") === "on" || formData.get("isPrimary") === "true",
  });
  unwrap(await supplierService.addContact(input, actor));
  revalidatePath(`/suppliers/${input.supplierId}`);
}

export async function removeContactAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { supplierId, contactId } = parse(contactRefSchema, {
    supplierId: field(formData, "supplierId"),
    contactId: field(formData, "contactId"),
  });
  unwrap(await supplierService.removeContact(supplierId, contactId, actor));
  revalidatePath(`/suppliers/${supplierId}`);
}

export async function addDocumentAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const input = parse(supplierDocumentSchema, {
    supplierId: field(formData, "supplierId"),
    name: field(formData, "name"),
    docType: field(formData, "docType"),
    url: field(formData, "url"),
  });
  unwrap(await supplierService.addDocument(input, actor));
  revalidatePath(`/suppliers/${input.supplierId}`);
}

export async function removeDocumentAction(formData: FormData): Promise<void> {
  const actor = await requireManager();
  const { supplierId, documentId } = parse(documentRefSchema, {
    supplierId: field(formData, "supplierId"),
    documentId: field(formData, "documentId"),
  });
  unwrap(await supplierService.removeDocument(supplierId, documentId, actor));
  revalidatePath(`/suppliers/${supplierId}`);
}
