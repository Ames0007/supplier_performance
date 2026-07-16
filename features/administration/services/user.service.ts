import { AppError, err, ok, type Result } from "@/lib/errors";
import { EventBus, eventBus, createEvent } from "@/lib/events";
import { ROLES, type RoleCode } from "@/lib/auth";
import type { UserEntity, UserFilter } from "../types/user";
import { InMemoryUserRepository, type UserRepository } from "../repositories/user.repository";

/** Domain events published by the user aggregate (DOMAIN_MODEL §3.24). */
export const USER_EVENTS = {
  PROVISIONED: "UserProvisioned",
  ROLE_ASSIGNED: "UserRoleAssigned",
  DEACTIVATED: "UserDeactivated",
} as const;

export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly bus: EventBus = eventBus,
  ) {}

  listUsers(filter?: UserFilter): Promise<UserEntity[]> {
    return this.repo.list(filter);
  }

  getUser(id: string): Promise<UserEntity | null> {
    return this.repo.findById(id);
  }

  /** Assign roles (with scope). Invariant: an active user keeps ≥1 role. */
  async assignRoles(userId: string, roleCodes: RoleCode[]): Promise<Result<UserEntity>> {
    const user = await this.repo.findById(userId);
    if (!user) return err(AppError.notFound("Utilisateur introuvable."));
    if (user.status === "ACTIVE" && roleCodes.length === 0) {
      return err(AppError.validation("Au moins un rôle est requis."));
    }
    const updated: UserEntity = {
      ...user,
      roleCodes: [...roleCodes],
      updatedAt: new Date().toISOString(),
    };
    await this.repo.save(updated);
    await this.bus.publish(
      createEvent(USER_EVENTS.ROLE_ASSIGNED, { userId, roleCodes: [...roleCodes] }),
    );
    return ok(updated);
  }

  /** Deactivate a user. Invariant: the last active administrator is preserved. */
  async deactivate(userId: string): Promise<Result<UserEntity>> {
    const user = await this.repo.findById(userId);
    if (!user) return err(AppError.notFound("Utilisateur introuvable."));
    if (user.status === "INACTIVE") return ok(user);
    const isAdmin = user.roleCodes.includes(ROLES.SUPER_ADMIN);
    if (isAdmin && (await this.repo.countActiveAdmins()) <= 1) {
      return err(AppError.conflict("Au moins un administrateur doit être conservé."));
    }
    const updated: UserEntity = {
      ...user,
      status: "INACTIVE",
      updatedAt: new Date().toISOString(),
    };
    await this.repo.save(updated);
    await this.bus.publish(createEvent(USER_EVENTS.DEACTIVATED, { userId }));
    return ok(updated);
  }
}

export const userService = new UserService(new InMemoryUserRepository());
