import { describe, expect, it } from "vitest";
import { DEMO_DISCOVERY_PROFILE, type DiscoveryRow } from "@/lib/discovery";
import { DEMO_JOBS, type DemoJob } from "@/lib/demo-contract";
import { buildTodayShortlist, compareShortlistRows, SHORTLIST_POLICY, type ShortlistAnalysis } from "@/lib/shortlist";
import { scoreJob } from "@/server/build-week/scorer";

function analysis(job: DemoJob): ShortlistAnalysis {
  const result = scoreJob(job);
  const strongest = [...result.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((left, right) => right.earnedMidMicroPoints - left.earnedMidMicroPoints)[0];
  const gap = [...result.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0 || group.matchClass === "UNKNOWN").sort((left, right) => right.pointsLostMicroPoints - left.pointsLostMicroPoints)[0];
  return { jobId: job.id, score: result.displayedScore, evidenceQuality: result.evidenceQuality, evidenceSufficient: result.numericScoreEligibility, confirmedBlockerCount: result.confirmedBlockerCount, priority: result.applyPriority, strongestCapability: strongest?.canonicalName ?? "Supported evidence only", largestGap: gap?.canonicalName ?? "No confirmed point loss" };
}

function row(options: Partial<ShortlistAnalysis> & { id?: string; distance?: number | null; postedAt?: string } = {}): DiscoveryRow<ShortlistAnalysis> {
  const base = DEMO_JOBS[0]!;
  const id = options.id ?? "row";
  return {
    job: { ...base, id, postedAt: options.postedAt ?? "2026-07-17T00:00:00.000Z" },
    analysis: { jobId: id, score: options.score ?? 70, evidenceQuality: options.evidenceQuality ?? 80, evidenceSufficient: options.evidenceSufficient ?? true, confirmedBlockerCount: options.confirmedBlockerCount ?? 0, priority: options.priority ?? "REVIEW", strongestCapability: options.strongestCapability ?? "Match", largestGap: options.largestGap ?? "Gap" },
    distanceMiles: options.distance === undefined ? 10 : options.distance,
    distanceLabel: options.distance === null ? "Remote" : `${options.distance ?? 10} miles`,
    remoteCompatible: options.distance === null,
    withinPreferredArea: true,
  };
}

describe("JP-BW8 transparent shortlist policy", () => {
  it("publishes the exact seven-factor order with no hidden total", () => {
    expect(SHORTLIST_POLICY).toEqual([
      "Numeric-score eligible roles first",
      "No confirmed blocker first",
      "Fit Score, highest first",
      "Evidence Quality, highest first",
      "Physical distance, nearest first; Remote follows physical distances",
      "Posting freshness, newest first",
      "Stable job ID, alphabetical",
    ]);
    expect(JSON.stringify(SHORTLIST_POLICY).toLowerCase()).not.toContain("weight");
  });

  it("applies every tie-break in the documented order", () => {
    expect(compareShortlistRows(row({ evidenceSufficient: true }), row({ evidenceSufficient: false }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ confirmedBlockerCount: 0 }), row({ confirmedBlockerCount: 1 }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ score: 80 }), row({ score: 70 }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ evidenceQuality: 90 }), row({ evidenceQuality: 80 }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ distance: 5 }), row({ distance: 15 }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ distance: 5 }), row({ distance: null }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ postedAt: "2026-07-17T00:00:00.000Z" }), row({ postedAt: "2026-07-16T00:00:00.000Z" }))).toBeLessThan(0);
    expect(compareShortlistRows(row({ id: "a" }), row({ id: "b" }))).toBeLessThan(0);
  });

  it("selects exactly three deterministic roles with four concise rationale items", () => {
    const analyses = DEMO_JOBS.map(analysis);
    const first = buildTodayShortlist(DEMO_JOBS, analyses, DEMO_DISCOVERY_PROFILE);
    const second = buildTodayShortlist(DEMO_JOBS, analyses, DEMO_DISCOVERY_PROFILE);
    expect(first).toHaveLength(3);
    expect(first.map((item) => item.job.id)).toEqual(second.map((item) => item.job.id));
    expect(first.map((item) => item.rank)).toEqual([1, 2, 3]);
    expect(first.every((item) => item.rationale.length === 4)).toBe(true);
    expect(first.every((item) => item.rationale.map((reason) => reason.label).join("|") === "Fit|Compatibility|Freshness|Blocker")).toBe(true);
  });

  it("keeps work mode, distance, and freshness outside technical Fit Score", () => {
    const original = DEMO_JOBS[0]!;
    const changed: DemoJob = { ...original, postedAt: "2020-01-01T00:00:00.000Z", locations: [{ label: "Remote", latitude: null, longitude: null, workModes: ["REMOTE"] }] };
    const before = scoreJob(original);
    const after = scoreJob(changed);
    expect(after.displayedScore).toBe(before.displayedScore);
    expect(after.evidenceQuality).toBe(before.evidenceQuality);
    expect(after.classTotals).toEqual(before.classTotals);
    expect(after.capabilityGroups.map((group) => [group.id, group.earnedMidMicroPoints])).toEqual(before.capabilityGroups.map((group) => [group.id, group.earnedMidMicroPoints]));
  });
});
