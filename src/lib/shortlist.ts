import { buildDiscoveryRow, type DiscoveryProfile, type DiscoveryRow } from "@/lib/discovery";
import type { DemoJob } from "@/lib/demo-contract";

export const SHORTLIST_POLICY_VERSION = "jobpilot-transparent-shortlist.v1";
export const SHORTLIST_POLICY = [
  "Numeric-score eligible roles first",
  "No confirmed blocker first",
  "Fit Score, highest first",
  "Evidence Quality, highest first",
  "Physical distance, nearest first; Remote follows physical distances",
  "Posting freshness, newest first",
  "Stable job ID, alphabetical",
] as const;

export type ShortlistAnalysis = {
  jobId: string;
  score: number | null;
  evidenceQuality: number;
  evidenceSufficient: boolean;
  confirmedBlockerCount: number;
  priority: string;
  strongestCapability: string;
  largestGap: string;
};

export type ShortlistRow = DiscoveryRow<ShortlistAnalysis> & {
  rank: number;
  rationale: [
    { label: "Fit"; value: string },
    { label: "Compatibility"; value: string },
    { label: "Freshness"; value: string },
    { label: "Blocker"; value: string },
  ];
};

const descending = (left: number, right: number) => right - left;
const postingTime = (row: DiscoveryRow<ShortlistAnalysis>) => Date.parse(row.job.postedAt);
const distanceOrder = (row: DiscoveryRow<ShortlistAnalysis>) => row.distanceMiles ?? Number.POSITIVE_INFINITY;

export function compareShortlistRows(left: DiscoveryRow<ShortlistAnalysis>, right: DiscoveryRow<ShortlistAnalysis>) {
  return Number(right.analysis.evidenceSufficient) - Number(left.analysis.evidenceSufficient)
    || left.analysis.confirmedBlockerCount - right.analysis.confirmedBlockerCount
    || descending(left.analysis.score ?? -1, right.analysis.score ?? -1)
    || descending(left.analysis.evidenceQuality, right.analysis.evidenceQuality)
    || distanceOrder(left) - distanceOrder(right)
    || descending(postingTime(left), postingTime(right))
    || left.job.id.localeCompare(right.job.id);
}

function rationaleFor(row: DiscoveryRow<ShortlistAnalysis>): ShortlistRow["rationale"] {
  return [
    { label: "Fit", value: row.analysis.score === null ? "No numeric score" : `${row.analysis.score} / 100 · evidence ${row.analysis.evidenceQuality.toFixed(1)}` },
    { label: "Compatibility", value: `${row.distanceLabel} · ${row.analysis.priority.replaceAll("_", " ").toLowerCase()} priority` },
    { label: "Freshness", value: freshnessLabel(row.job.postedAt) },
    { label: "Blocker", value: row.analysis.confirmedBlockerCount === 0 ? "None confirmed" : `${row.analysis.confirmedBlockerCount} confirmed` },
  ];
}

export function buildTodayShortlist(jobs: DemoJob[], analyses: ShortlistAnalysis[], profile: DiscoveryProfile, limit = 3): ShortlistRow[] {
  const byId = new Map(analyses.map((analysis) => [analysis.jobId, analysis]));
  return jobs
    .map((job) => {
      const analysis = byId.get(job.id);
      if (!analysis) throw new Error(`Shortlist analysis is missing for ${job.id}.`);
      return buildDiscoveryRow(job, analysis, profile);
    })
    .sort(compareShortlistRows)
    .slice(0, Math.max(0, limit))
    .map((row, index) => ({ ...row, rank: index + 1, rationale: rationaleFor(row) }));
}

export function freshnessLabel(postedAt: string, asOf = new Date("2026-07-18T17:41:08.379Z")) {
  const days = Math.max(0, Math.floor((asOf.getTime() - Date.parse(postedAt)) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}
