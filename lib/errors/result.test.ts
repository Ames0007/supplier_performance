import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr, map, unwrap } from "./result";
import { AppError } from "./app-error";

describe("Result", () => {
  it("ok wraps a value", () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("err wraps an error", () => {
    const result = err(AppError.notFound());
    expect(isErr(result)).toBe(true);
  });

  it("map transforms ok values", () => {
    expect(unwrap(map(ok(2), (n) => n * 3))).toBe(6);
  });

  it("map passes err through untouched", () => {
    const mapped = map(err(AppError.internal("boom")), (n: number) => n + 1);
    expect(mapped.ok).toBe(false);
  });

  it("unwrap throws on err", () => {
    expect(() => unwrap(err(AppError.forbidden()))).toThrow();
  });
});
