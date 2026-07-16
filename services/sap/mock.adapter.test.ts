import { describe, it, expect } from "vitest";
import { MockSapAdapter } from "./mock.adapter";

describe("MockSapAdapter", () => {
  it("returns a deterministic connection status", async () => {
    const status = await new MockSapAdapter().ping();
    expect(status).toEqual({ ok: true, source: "mock", checkedAt: "1970-01-01T00:00:00.000Z" });
  });
});
