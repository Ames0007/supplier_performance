import type { Entity, Id, IsoDateTime } from "@/types";
import type { RoleCode } from "@/lib/auth";

/** User account status (DOMAIN_MODEL §3.24). */
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * User aggregate root (C9 Identity & Administration). Identity originates from
 * Microsoft Entra (JIT); role assignments are scoped by campus/department.
 */
export interface UserEntity extends Entity {
  readonly email: string;
  readonly displayName: string;
  readonly jobTitle: string | null;
  readonly departmentIds: Id[];
  readonly campusIds: Id[];
  readonly roleCodes: RoleCode[];
  readonly status: UserStatus;
  readonly lastLoginAt: IsoDateTime | null;
  /** External Entra object id (identity reference). */
  readonly identityRef: string | null;
}

export interface UserFilter {
  readonly search?: string;
  readonly status?: UserStatus;
  readonly role?: RoleCode;
}
