import { describe, expect, it } from "vitest";
import { productSpaces } from "./product-spaces";

describe("SenMenuisier navigation contract", () => {
  it("keeps the six approved workshop spaces in the required order", () => {
    expect(productSpaces.map((space) => space.id)).toEqual([
      "catalogue",
      "production",
      "sante",
      "prix",
      "crm",
      "roadmap",
    ]);
  });

  it("provides a clear label and practical description for every space", () => {
    expect(productSpaces).toHaveLength(6);
    for (const space of productSpaces) {
      expect(space.label.trim().length).toBeGreaterThan(5);
      expect(space.title.trim().length).toBeGreaterThan(5);
      expect(space.summary.trim().length).toBeGreaterThan(30);
      expect(space.icon).toBeDefined();
    }
  });
});
