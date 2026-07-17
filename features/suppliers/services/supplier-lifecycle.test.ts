import { describe, it, expect } from "vitest";
import { canTransition, nextLifecycleStatus } from "./supplier-lifecycle";
import { SUPPLIER_LIFECYCLE } from "../types/supplier";

describe("supplier lifecycle transitions", () => {
  it("approves only from PROSPECT", () => {
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.PROSPECT, "approve")).toBe(SUPPLIER_LIFECYCLE.APPROVED);
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.APPROVED, "approve")).toBeNull();
  });

  it("blocks from an active state but not from blocked/archived", () => {
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.STRATEGIC, "block")).toBe(SUPPLIER_LIFECYCLE.BLOCKED);
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.BLOCKED, "block")).toBeNull();
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.ARCHIVED, "block")).toBeNull();
  });

  it("unblocks only from BLOCKED", () => {
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.BLOCKED, "unblock")).toBe(SUPPLIER_LIFECYCLE.APPROVED);
    expect(canTransition(SUPPLIER_LIFECYCLE.APPROVED, "unblock")).toBe(false);
  });

  it("reactivates only from ARCHIVED", () => {
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.ARCHIVED, "reactivate")).toBe(SUPPLIER_LIFECYCLE.APPROVED);
    expect(canTransition(SUPPLIER_LIFECYCLE.APPROVED, "reactivate")).toBe(false);
  });

  it("archives from any non-archived state", () => {
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.PREFERRED, "archive")).toBe(SUPPLIER_LIFECYCLE.ARCHIVED);
    expect(nextLifecycleStatus(SUPPLIER_LIFECYCLE.ARCHIVED, "archive")).toBeNull();
  });
});
