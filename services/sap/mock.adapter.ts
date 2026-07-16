import type { SapAdapter, SapConnectionStatus } from "./adapter.interface";

/** Deterministic mock adapter for dev/CI (no live SAP dependency). */
export class MockSapAdapter implements SapAdapter {
  readonly name = "mock";

  async ping(): Promise<SapConnectionStatus> {
    return { ok: true, source: "mock", checkedAt: "1970-01-01T00:00:00.000Z" };
  }
}
