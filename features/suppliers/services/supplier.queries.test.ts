import { describe, it, expect } from "vitest";
import { buildSession, ROLES } from "@/lib/auth";
import { SupplierQueries } from "./supplier.queries";
import { InMemorySupplierRepository } from "../repositories/supplier.repository";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const ACME_ID = "50000000-0000-0000-0000-000000000001";

const readAllViewer = buildSession({
  id: "director-1",
  email: "d@um6p.ma",
  displayName: "Directeur",
  roleCodes: [ROLES.PROCUREMENT_DIRECTOR], // suppliers.read.all
});
const ownerViewer = buildSession({
  id: ADMIN_ID,
  email: "p@um6p.ma",
  displayName: "Acheteur",
  roleCodes: [ROLES.PURCHASER], // suppliers.read (own only)
});
const otherViewer = buildSession({
  id: "other-user",
  email: "o@um6p.ma",
  displayName: "Autre",
  roleCodes: [ROLES.PURCHASER],
});

function make() {
  return new SupplierQueries(new InMemorySupplierRepository());
}

describe("SupplierQueries scope & search", () => {
  it("read.all sees every supplier", async () => {
    const rows = await make().list(readAllViewer);
    expect(rows.length).toBe(4);
  });

  it("read (own) sees only owned suppliers", async () => {
    const rows = await make().list(ownerViewer);
    expect(rows.length).toBe(2);
    expect(rows.every((row) => row.ownerUserId === ADMIN_ID)).toBe(true);
  });

  it("read (own) with no owned suppliers sees none", async () => {
    const rows = await make().list(otherViewer);
    expect(rows.length).toBe(0);
  });

  it("filters by search term", async () => {
    const rows = await make().list(readAllViewer, { search: "acme" });
    expect(rows.length).toBe(1);
    expect(rows[0]?.name).toContain("ACME");
  });

  it("getDetail denies out-of-scope access (fail-closed)", async () => {
    const detail = await make().getDetail(otherViewer, ACME_ID);
    expect(detail).toBeNull();
  });

  it("getDetail returns the aggregate for a permitted viewer", async () => {
    const detail = await make().getDetail(readAllViewer, ACME_ID);
    expect(detail?.supplier.name).toContain("ACME");
    expect(detail?.category?.name).toBeTruthy();
  });
});
