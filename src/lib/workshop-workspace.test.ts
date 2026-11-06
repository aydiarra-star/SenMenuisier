import { describe, expect, it } from "vitest";
import { calculateOperationalHealth, nextProductionStatus, type ProductionJob } from "./workshop-workspace";

const jobs: ProductionJob[] = [
  { id: "1", title: "Armoire", client: "A", dueDate: "2026-11-01", status: "livre", createdAt: "2026-10-01", completedAt: "2026-10-30" },
  { id: "2", title: "Cuisine", client: "B", dueDate: "2026-11-02", status: "livre", createdAt: "2026-10-02", completedAt: "2026-11-03" },
  { id: "3", title: "Bureau", client: "C", dueDate: "2026-11-04", status: "livre", createdAt: "2026-10-03", completedAt: "2026-11-04" },
];

describe("atelier modules", () => {
  it("does not publish a health score before three completed jobs", () => {
    expect(calculateOperationalHealth(jobs.slice(0, 2)).score).toBeNull();
  });
  it("calculates on-time delivery score from completed real records", () => {
    expect(calculateOperationalHealth(jobs).score).toBe(67);
    expect(calculateOperationalHealth(jobs).onTimeCount).toBe(2);
  });
  it("moves a production job one step forward and stops at delivery", () => {
    expect(nextProductionStatus("preparation")).toBe("debit");
    expect(nextProductionStatus("livre")).toBe("livre");
  });
});
