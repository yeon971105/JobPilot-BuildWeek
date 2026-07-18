import { describe, expect, it } from "vitest";
import { DEMO_JOBS, type DemoJob } from "@/lib/demo-contract";
import { buildDiscoveryRow, DEMO_DISCOVERY_PROFILE, filterDiscoveryRows, haversineMiles, nearestDistance, sortDiscoveryRows, type DiscoveryAnalysis } from "@/lib/discovery";
import { scoreJob } from "@/server/build-week/scorer";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function analysis(job: DemoJob): DiscoveryAnalysis {
  const value = scoreJob(job);
  return { score: value.displayedScore, evidenceQuality: value.evidenceQuality, evidenceSufficient: value.numericScoreEligibility, confirmedBlockerCount: value.confirmedBlockerCount, priority: value.applyPriority };
}
function rows() { return DEMO_JOBS.map((job) => buildDiscoveryRow(job, analysis(job), DEMO_DISCOVERY_PROFILE)); }
const ids = (value: ReturnType<typeof rows>) => value.map((row) => row.job.id);
const defaultFilters = { query: "", workMode: "ALL", seniority: "ALL", minimumScore: 0, evidenceSufficientOnly: false, priority: "ALL", blocker: "ALL" as const, withinPreferredArea: false, remoteCompatible: false };

describe("nearby discovery contract", () => {
  it("calculates deterministic Haversine distance and the nearest physical location", () => {
    expect(haversineMiles({ latitude: 37.8044, longitude: -122.2712 }, { latitude: 37.7749, longitude: -122.4194 })).toBeCloseTo(8.3448, 3);
    const job = clone(DEMO_JOBS[0]!);
    job.locations = [
      { label: "Far synthetic office", workModes: ["HYBRID"], latitude: 34.0522, longitude: -118.2437 },
      { label: "Home synthetic office", workModes: ["ONSITE"], latitude: 37.8044, longitude: -122.2712 },
    ];
    expect(nearestDistance(job, DEMO_DISCOVERY_PROFILE)).toBe(0);
  });

  it("labels remote-only roles without inventing a distance", () => {
    const remote = rows().find((row) => row.job.id === "harbor-product-data-analyst")!;
    expect(remote.distanceMiles).toBeNull();
    expect(remote.distanceLabel).toBe("Remote");
    expect(remote.remoteCompatible).toBe(true);
    expect(remote.withinPreferredArea).toBe(true);
  });

  it("keeps location outside the deterministic technical score", () => {
    const original = clone(DEMO_JOBS[0]!);
    const moved = clone(original);
    moved.locations = moved.locations.map((location) => ({ ...location, latitude: 40.7128, longitude: -74.0060 }));
    const before = scoreJob(original);
    const after = scoreJob(moved);
    expect(after.displayedScore).toBe(before.displayedScore);
    expect(after.classTotals).toEqual(before.classTotals);
    expect(after.capabilityGroups).toEqual(before.capabilityGroups);
  });

  it("produces exact stable orders for every visible sort", () => {
    const input = rows();
    expect(ids(sortDiscoveryRows(input, "BEST_MATCH"))).toEqual([
      "harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "alder-data-platform-engineer",
      "juniper-customer-ai-enablement-lead", "meridian-ml-infrastructure-engineer", "mosaic-junior-software-engineer",
    ]);
    expect(ids(sortDiscoveryRows(input, "NEAREST"))).toEqual([
      "alder-data-platform-engineer", "mosaic-junior-software-engineer", "northstar-applied-ai-solutions-engineer",
      "juniper-customer-ai-enablement-lead", "meridian-ml-infrastructure-engineer", "harbor-product-data-analyst",
    ]);
    expect(ids(sortDiscoveryRows(input, "MOST_RECENT"))).toEqual([
      "harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "alder-data-platform-engineer",
      "meridian-ml-infrastructure-engineer", "juniper-customer-ai-enablement-lead", "mosaic-junior-software-engineer",
    ]);
    expect(ids(sortDiscoveryRows(input, "HIGHEST_EVIDENCE"))).toEqual([
      "harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "juniper-customer-ai-enablement-lead",
      "alder-data-platform-engineer", "meridian-ml-infrastructure-engineer", "mosaic-junior-software-engineer",
    ]);
    expect(ids(sortDiscoveryRows(input, "BEST_MATCH"))).toEqual(ids(sortDiscoveryRows([...input].reverse(), "BEST_MATCH")));
  });

  it("applies each visible filter without changing row evidence", () => {
    const input = rows();
    expect(filterDiscoveryRows(input, { ...defaultFilters, query: "northstar" }).map((row) => row.job.id)).toEqual(["northstar-applied-ai-solutions-engineer"]);
    expect(filterDiscoveryRows(input, { ...defaultFilters, workMode: "ONSITE" }).every((row) => row.job.locations.some((location) => location.workModes.includes("ONSITE")))).toBe(true);
    expect(filterDiscoveryRows(input, { ...defaultFilters, seniority: "ENTRY_LEVEL" }).map((row) => row.job.id)).toEqual(["mosaic-junior-software-engineer"]);
    expect(filterDiscoveryRows(input, { ...defaultFilters, minimumScore: 90 }).every((row) => (row.analysis.score ?? -1) >= 90)).toBe(true);
    expect(filterDiscoveryRows(input, { ...defaultFilters, evidenceSufficientOnly: true })).toHaveLength(5);
    expect(filterDiscoveryRows(input, { ...defaultFilters, priority: "HIGH" }).every((row) => row.analysis.priority === "HIGH")).toBe(true);
    expect(filterDiscoveryRows(input, { ...defaultFilters, blocker: "BLOCKED" }).every((row) => row.analysis.confirmedBlockerCount > 0)).toBe(true);
    expect(filterDiscoveryRows(input, { ...defaultFilters, withinPreferredArea: true }).every((row) => row.withinPreferredArea)).toBe(true);
    expect(filterDiscoveryRows(input, { ...defaultFilters, remoteCompatible: true }).every((row) => row.remoteCompatible)).toBe(true);
    expect(input.map((row) => row.analysis)).toEqual(rows().map((row) => row.analysis));
  });
});
