import { z } from "@/lib/validation";
import {
  CONTACT_KIND,
  SUPPLIER_LIFECYCLE,
  SUPPLIER_TIER,
  type ContactKind,
  type SupplierLifecycleStatus,
  type SupplierTier,
} from "../types/supplier";

const LIFECYCLE_VALUES = Object.values(SUPPLIER_LIFECYCLE) as [
  SupplierLifecycleStatus,
  ...SupplierLifecycleStatus[],
];
const TIER_VALUES = Object.values(SUPPLIER_TIER) as [SupplierTier, ...SupplierTier[]];
const CONTACT_KIND_VALUES = Object.values(CONTACT_KIND) as [ContactKind, ...ContactKind[]];

const optionalEmail = z.string().trim().email("Adresse email invalide.").optional().or(z.literal(""));

/** Create a supplier (manual). SAP-sourced suppliers arrive via Phase 3 sync. */
export const createSupplierSchema = z.object({
  code: z.string().trim().min(1, "Le code fournisseur est requis.").max(50),
  name: z.string().trim().min(1, "Le nom est requis.").max(200),
  legalName: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  email: optionalEmail,
  phone: z.string().trim().max(50).optional(),
  taxId: z.string().trim().max(50).optional(),
  ownerUserId: z.string().uuid().optional(),
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .extend({ id: z.string().uuid() });
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const supplierFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(LIFECYCLE_VALUES).optional(),
  tier: z.enum(TIER_VALUES).optional(),
  categoryId: z.string().optional(),
  campusId: z.string().optional(),
});
export type SupplierFilterInput = z.infer<typeof supplierFilterSchema>;

export const blockSupplierSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().min(5, "Veuillez saisir une raison (au moins 5 caractères)."),
});
export type BlockSupplierInput = z.infer<typeof blockSupplierSchema>;

export const classifySupplierSchema = z.object({
  id: z.string().uuid(),
  tier: z.enum(TIER_VALUES),
});
export type ClassifySupplierInput = z.infer<typeof classifySupplierSchema>;

export const supplierContactSchema = z.object({
  supplierId: z.string().uuid(),
  kind: z.enum(CONTACT_KIND_VALUES),
  name: z.string().trim().min(1, "Le nom est requis.").max(200),
  role: z.string().trim().max(120).optional(),
  email: optionalEmail,
  phone: z.string().trim().max(50).optional(),
  isPrimary: z.boolean(),
});
export type SupplierContactInput = z.infer<typeof supplierContactSchema>;

export const supplierDocumentSchema = z.object({
  supplierId: z.string().uuid(),
  name: z.string().trim().min(1, "Le nom est requis.").max(200),
  docType: z.string().trim().min(1, "Le type est requis.").max(80),
  url: z.string().trim().url("URL invalide.").optional().or(z.literal("")),
});
export type SupplierDocumentInput = z.infer<typeof supplierDocumentSchema>;
