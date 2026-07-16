import { ROLES } from "@/lib/auth";
import type { UserEntity, UserFilter } from "../types/user";

/**
 * Persistence port for users. The concrete Supabase implementation is wired at
 * P1 completion; Phase 1 uses the deterministic in-memory implementation below.
 */
export interface UserRepository {
  list(filter?: UserFilter): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  countActiveAdmins(): Promise<number>;
}

const NOW = "2026-01-01T09:00:00.000Z";

const SEED: UserEntity[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@um6p.ma",
    displayName: "Administrateur SPM",
    jobTitle: "Administrateur des achats",
    departmentIds: [],
    campusIds: [],
    roleCodes: [ROLES.SUPER_ADMIN],
    status: "ACTIVE",
    lastLoginAt: NOW,
    identityRef: "entra-0001",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "directeur@um6p.ma",
    displayName: "Directeur des Achats",
    jobTitle: "Directeur des achats",
    departmentIds: [],
    campusIds: [],
    roleCodes: [ROLES.PROCUREMENT_DIRECTOR],
    status: "ACTIVE",
    lastLoginAt: NOW,
    identityRef: "entra-0002",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "acheteur@um6p.ma",
    displayName: "Acheteur Test",
    jobTitle: "Acheteur",
    departmentIds: [],
    campusIds: [],
    roleCodes: [ROLES.PURCHASER],
    status: "ACTIVE",
    lastLoginAt: null,
    identityRef: "entra-0003",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    email: "auditeur@um6p.ma",
    displayName: "Auditeur Interne",
    jobTitle: "Audit & Conformité",
    departmentIds: [],
    campusIds: [],
    roleCodes: [ROLES.AUDITOR],
    status: "INACTIVE",
    lastLoginAt: null,
    identityRef: "entra-0004",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export class InMemoryUserRepository implements UserRepository {
  private readonly users: Map<string, UserEntity>;

  constructor(seed: readonly UserEntity[] = SEED) {
    this.users = new Map(seed.map((user) => [user.id, user]));
  }

  async list(filter?: UserFilter): Promise<UserEntity[]> {
    let result = [...this.users.values()];
    if (filter?.search) {
      const needle = filter.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
      );
    }
    if (filter?.status) result = result.filter((u) => u.status === filter.status);
    if (filter?.role) result = result.filter((u) => u.roleCodes.includes(filter.role!));
    return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async countActiveAdmins(): Promise<number> {
    return [...this.users.values()].filter(
      (u) => u.status === "ACTIVE" && u.roleCodes.includes(ROLES.SUPER_ADMIN),
    ).length;
  }
}
