import { z, type ZodType } from "zod";
import { AppError } from "@/lib/errors";

export { z };
export { zodResolver } from "@hookform/resolvers/zod";

/**
 * Validate `data` against `schema`, throwing a typed AppError (validation kind)
 * with field issues on failure. Used at every server boundary (Server Actions,
 * API routes) per the blueprint's command convention.
 */
export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const message = first ? first.message : "Validation failed";
    throw AppError.validation(message, result.error.flatten());
  }
  return result.data;
}
