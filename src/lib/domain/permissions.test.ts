import { describe, expect, it } from "vitest";
import { canAccessWorkshopPermission } from "./permissions";

describe("workshop permission defaults", () => {
  it("gives the owner full access, including financial records", () => {
    expect(canAccessWorkshopPermission("owner", "finance.read")).toBe(true);
    expect(canAccessWorkshopPermission("owner", "finance.write")).toBe(true);
    expect(canAccessWorkshopPermission("owner", "members.manage")).toBe(true);
  });

  it("keeps financial access denied to non-owners by default", () => {
    for (const role of ["manager", "carpenter", "apprentice"] as const) {
      expect(canAccessWorkshopPermission(role, "finance.read")).toBe(false);
      expect(canAccessWorkshopPermission(role, "finance.write")).toBe(false);
      expect(canAccessWorkshopPermission(role, "quotes.costs.read")).toBe(false);
      expect(canAccessWorkshopPermission(role, "quotes.costs.write")).toBe(false);
      expect(canAccessWorkshopPermission(role, "inventory.costs.read")).toBe(false);
      expect(canAccessWorkshopPermission(role, "suppliers.costs.read")).toBe(false);
    }
  });

  it("allows only explicitly supplied server-verified grants to extend access", () => {
    expect(canAccessWorkshopPermission("manager", "finance.read")).toBe(false);
    expect(canAccessWorkshopPermission("manager", "finance.read", ["finance.read"])).toBe(true);
    expect(canAccessWorkshopPermission("manager", "quotes.costs.read", ["quotes.costs.read"])).toBe(true);
    expect(canAccessWorkshopPermission("manager", "finance.write", ["finance.read"])).toBe(false);
    expect(canAccessWorkshopPermission("manager", "finance.write", ["finance.write"])).toBe(true);
  });

  it("keeps apprentices away from member management and financial data", () => {
    expect(canAccessWorkshopPermission("apprentice", "members.manage")).toBe(false);
    expect(canAccessWorkshopPermission("apprentice", "finance.read")).toBe(false);
  });
});
