import { AppError, err, ok, type Result } from "@/lib/errors";
import { EventBus, eventBus, createEvent } from "@/lib/events";
import { DEFAULT_ROLE, ROLES, type RoleCode } from "@/lib/auth";
import type { Id } from "@/types";
import type { UserEntity, UserFilter } from "../types/user";
import { InMemoryUserRepository, type UserRepository } from "../repositories/user.repository";

/** Domain events published by the user aggregate (DOMAIN_MODEL §3.24). */
export const USER_EVENTS = {
  PROVISIONED: "UserProvisioned",
  ROLE_ASSIGNED: "UserRoleAssigned",
  DEACTIVATED: "UserDeactivated",
} as const;

/** The user performing a mutation (for real-actor audit). */
export interface Actor {
  readonly id: Id;
  readonly name: string;
}

/** External identity resolved from Microsoft Entra via Supabase Auth. */
export interface ProvisionIdentity {
  readonly subjectId: string;
  readonly email: string;
  readonly displayName: string;
}

function actorPayload(actor?: Actor): { actorId: Id | null; actorName: string } {
  return { actorId: actor?.id ?? null, actorName: actor?.name ?? "Système" };
}

export class UserService {
  constructor(
    private repo: UserRepository,
    private readonly bus: EventBus = eventBus,
  ) {}

  /** Composition-root swap to the production (Supabase) repository. */
  setRepository(repo: UserRepository): void {
    this.repo = repo;
  }

  listUsers(filter?: UserFilter): Promise<UserEntity[]> {
    return this.repo.list(filter);
  }

  getUser(id: string): Promise<UserEntity | null> {
    return this.repo.findById(id);
  }

  /**
   * Resolve the app user for an authenticated Entra identity, creating it on
   * first sight (JIT) with the default role. Read-mostly: only writes when
   * creating, or when `touchLogin` is set (login moment).
   */
  async provisionFromIdentity(
    identity: ProvisionIdentity,
    opts: { touchLogin?: boolean } = {},
  ): Promise<UserEntity> {
    const existing =
      (await this.repo.findByIdentityRef(identity.subjectId)) ??
      (await this.repo.findByEmail(identity.email));
    const now = new Date().toISOString();

    if (existing) {
      if (!opts.touchLogin) return existing;
      const updated: UserEntity = {
        ...existing,
        identityRef: existing.identityRef ?? identity.subjectId,
        lastLoginAt: now,
        updatedAt: now,
      };
      await this.repo.save(updated);
      return updated;
    }

    const created: UserEntity = {
      id: crypto.randomUUID(),
      email: identity.email,
      displayName: identity.displayName || identity.email,
      jobTitle: null,
      departmentIds: [],
      campusIds: [],
      roleCodes: [DEFAULT_ROLE],
      status: "ACTIVE",
      lastLoginAt: opts.touchLogin ? now : null,
      identityRef: identity.subjectId,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.save(created);
    await this.bus.publish(
      createEvent(USER_EVENTS.PROVISIONED, { userId: created.id, ...actorPayload() }),
    );
    return created;
  }

  /** Assign roles (with scope). Invariant: an active user keeps ≥1 role. */
  async assignRoles(userId: string, roleCodes: RoleCode[], actor?: Actor): Promise<Result<UserEntity>> {
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
      createEvent(USER_EVENTS.ROLE_ASSIGNED, {
        userId,
        roleCodes: [...roleCodes],
        ...actorPayload(actor),
      }),
    );
    return ok(updated);
  }

  /** Deactivate a user. Invariant: the last active administrator is preserved. */
  async deactivate(userId: string, actor?: Actor): Promise<Result<UserEntity>> {
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
    await this.bus.publish(
      createEvent(USER_EVENTS.DEACTIVATED, { userId, ...actorPayload(actor) }),
    );
    return ok(updated);
  }
}

/**
 * Default singleton uses the in-memory repository (dev/test/fallback). In
 * production the composition root swaps in the Supabase repository via
 * configureAdministrationPersistence().
 */
export const userService = new UserService(new InMemoryUserRepository());
