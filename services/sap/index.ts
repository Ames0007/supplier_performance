import type { SapAdapter } from "./adapter.interface";
import { MockSapAdapter } from "./mock.adapter";

export type { SapAdapter, SapConnectionStatus } from "./adapter.interface";
export { MockSapAdapter } from "./mock.adapter";

/** Returns the active SAP adapter. Phase 1: always the deterministic mock. */
export function getSapAdapter(): SapAdapter {
  return new MockSapAdapter();
}
