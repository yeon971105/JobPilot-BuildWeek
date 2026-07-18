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
  selectionReason: string;
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

function reasonFor(row: DiscoveryRow<ShortlistAnalysis>, rank: number) {
  const score = row.analysis.score === null ? "insufficient evidence for a numeric Fit Score" : `${row.analysis.score} Fit Score`;
  const blocker = row.analysis.confirmedBlockerCount === 0 ? "no confirmed blocker" : `${row.analysis.confirmedBlockerCount} confirmed blocker`;
  const evidence = `${row.analysis.evidenceQuality.toFixed(1)} Evidence Quality`;
  return `#${rank} after applying the published order: ${score}, ${blocker}, ${evidence}, ${row.distanceLabel}, then posting date and stable job ID.`;
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
    .map((row, index) => ({ ...row, rank: index + 1, selectionReason: reasonFor(row, index + 1) }));
}

export function freshnessLabel(postedAt: string, asOf = new Date()) {
  const days = Math.max(0, Math.floor((asOf.getTime() - Date.parse(postedAt)) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}
