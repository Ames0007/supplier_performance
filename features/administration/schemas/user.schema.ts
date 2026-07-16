import { z } from "@/lib/validation";
import { ROLES, type RoleCode } from "@/lib/auth";

const ROLE_VALUES = Object.values(ROLES) as [RoleCode, ...RoleCode[]];

export const roleCodeSchema = z.enum(ROLE_VALUES);

/** Assign roles + scope to a user (Screen 16 AssignRolesDialog). */
export const assignRolesSchema = z.object({
  userId: z.string().uuid(),
  roleCodes: z.array(roleCodeSchema).min(1, "Au moins un rôle est requis."),
  departmentIds: z.array(z.string()).default([]),
  campusIds: z.array(z.string()).default([]),
});

export type AssignRolesInput = z.infer<typeof assignRolesSchema>;

export const userFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  role: roleCodeSchema.optional(),
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;
