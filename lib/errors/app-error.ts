/**
 * AppError — the single typed error carried across the application/domain layers.
 * Server Actions map these to user-safe messages (never leak stack traces).
 */
export type ErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "internal";

const HTTP_STATUS: Record<ErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  internal: 500,
};

const USER_MESSAGE: Record<ErrorKind, string> = {
  validation: "Les données saisies sont invalides.",
  unauthorized: "Vous devez être connecté pour effectuer cette action.",
  forbidden: "Vous n'avez pas l'autorisation d'effectuer cette action.",
  not_found: "La ressource demandée est introuvable.",
  conflict: "Ces données ont été modifiées entre-temps. Rechargez la page.",
  internal: "Une erreur est survenue. Réessayez ou contactez l'administrateur.",
};

export interface AppErrorOptions {
  kind?: ErrorKind;
  cause?: unknown;
  details?: unknown;
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly httpStatus: number;
  readonly details: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.kind = options.kind ?? "internal";
    this.httpStatus = HTTP_STATUS[this.kind];
    this.details = options.details ?? null;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  /** Message safe to display to end users (no internal detail). */
  toUserMessage(): string {
    return this.kind === "validation" && this.message ? this.message : USER_MESSAGE[this.kind];
  }

  toJSON(): Record<string, unknown> {
    return { name: this.name, kind: this.kind, httpStatus: this.httpStatus, message: this.message };
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(message, { kind: "validation", details });
  }
  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, { kind: "unauthorized" });
  }
  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, { kind: "forbidden" });
  }
  static notFound(message = "Not found"): AppError {
    return new AppError(message, { kind: "not_found" });
  }
  static conflict(message = "Conflict"): AppError {
    return new AppError(message, { kind: "conflict" });
  }
  static internal(message = "Internal error", cause?: unknown): AppError {
    return new AppError(message, { kind: "internal", cause });
  }

  /** Normalize any thrown value into an AppError. */
  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError(error.message, { kind: "internal", cause: error });
    return new AppError("Unknown error", { kind: "internal", cause: error });
  }
}
