import { DEMO_CANDIDATE, type DemoJob } from "@/lib/demo-contract";

export type DiscoveryProfile = {
  label: string;
  homeCity: string;
  homeLatitude: number;
  homeLongitude: number;
  preferredRadiusMiles: number;
  acceptedWorkModes: string[];
  remotePreference: "WELCOME" | "NEUTRAL" | "AVOID";
};

export type DiscoveryAnalysis = {
  score: number | null;
  evidenceQuality: number;
  evidenceSufficient: boolean;
  confirmedBlockerCount: number;
  priority: string;
};

export type DiscoveryRow<T extends DiscoveryAnalysis = DiscoveryAnalysis> = {
  job: DemoJob;
  analysis: T;
  distanceMiles: number | null;
  distanceLabel: string;
  remoteCompatible: boolean;
  withinPreferredArea: boolean;
};

export type DiscoverySort = "BEST_MATCH" | "NEAREST" | "MOST_RECENT" | "HIGHEST_EVIDENCE";
export type DiscoveryFilters = {
  query: string;
  workMode: string;
  seniority: string;
  minimumScore: number;
  evidenceSufficientOnly: boolean;
  priority: string;
  blocker: "ALL" | "CLEAR" | "BLOCKED";
  withinPreferredArea: boolean;
  remoteCompatible: boolean;
};

export const DEMO_DISCOVERY_PROFILE: DiscoveryProfile = {
  label: DEMO_CANDIDATE.displayName,
  ...DEMO_CANDIDATE.discoveryLocation,
  remotePreference: DEMO_CANDIDATE.discoveryLocation.remotePreference as DiscoveryProfile["remotePreference"],
};

const EARTH_RADIUS_MILES = 3958.7613;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function haversineMiles(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestDistance(job: DemoJob, profile: DiscoveryProfile) {
  const physical = job.locations.filter((location): location is typeof location & { latitude: number; longitude: number } => typeof location.latitude === "number" && typeof location.longitude === "number" && Number.isFinite(location.latitude) && Number.isFinite(location.longitude));
  if (!physical.length) return null;
  return Math.min(...physical.map((location) => haversineMiles({ latitude: profile.homeLatitude, longitude: profile.homeLongitude }, location)));
}

export function buildDiscoveryRow<T extends DiscoveryAnalysis>(job: DemoJob, analysis: T, profile: DiscoveryProfile): DiscoveryRow<T> {
  const distanceMiles = nearestDistance(job, profile);
  const modes = new Set(job.locations.flatMap((location) => location.workModes));
  const fullyRemote = distanceMiles === null && modes.has("REMOTE");
  const remoteCompatible = modes.has("REMOTE") && profile.acceptedWorkModes.includes("REMOTE") && profile.remotePreference !== "AVOID";
  return {
    job,
    analysis,
    distanceMiles,
    distanceLabel: fullyRemote ? "Remote" : distanceMiles === null ? "Location unavailable" : `${distanceMiles.toFixed(1)} miles`,
    remoteCompatible,
    withinPreferredArea: distanceMiles !== null ? distanceMiles <= profile.preferredRadiusMiles : remoteCompatible,
  };
}

const descending = (left: number, right: number) => right - left;
const postingTime = (row: DiscoveryRow) => Date.parse(row.job.postedAt);
const distanceOrder = (row: DiscoveryRow) => row.distanceMiles ?? Number.POSITIVE_INFINITY;

export function sortDiscoveryRows<T extends DiscoveryAnalysis>(rows: DiscoveryRow<T>[], sort: DiscoverySort) {
  return [...rows].sort((left, right) => {
    if (sort === "NEAREST") return distanceOrder(left) - distanceOrder(right) || descending(postingTime(left), postingTime(right)) || left.job.id.localeCompare(right.job.id);
    if (sort === "MOST_RECENT") return descending(postingTime(left), postingTime(right)) || left.job.id.localeCompare(right.job.id);
    if (sort === "HIGHEST_EVIDENCE") return descending(left.analysis.evidenceQuality, right.analysis.evidenceQuality) || descending(left.analysis.score ?? -1, right.analysis.score ?? -1) || left.job.id.localeCompare(right.job.id);
    return Number(right.analysis.evidenceSufficient) - Number(left.analysis.evidenceSufficient)
      || left.analysis.confirmedBlockerCount - right.analysis.confirmedBlockerCount
      || descending(left.analysis.score ?? -1, right.analysis.score ?? -1)
      || descending(left.analysis.evidenceQuality, right.analysis.evidenceQuality)
      || distanceOrder(left) - distanceOrder(right)
      || descending(postingTime(left), postingTime(right))
      || left.job.id.localeCompare(right.job.id);
  });
}

export function filterDiscoveryRows<T extends DiscoveryAnalysis>(rows: DiscoveryRow<T>[], filters: DiscoveryFilters) {
  const query = filters.query.toLowerCase().trim();
  return rows.filter((row) => {
    const haystack = `${row.job.title} ${row.job.company}`.toLowerCase();
    const modeMatch = filters.workMode === "ALL" || row.job.locations.some((location) => location.workModes.includes(filters.workMode));
    const seniorityMatch = filters.seniority === "ALL" || row.job.seniority === filters.seniority;
    const minimumMatch = row.analysis.score === null ? filters.minimumScore === 0 : row.analysis.score >= filters.minimumScore;
    const priorityMatch = filters.priority === "ALL" || row.analysis.priority === filters.priority;
    const blockerMatch = filters.blocker === "ALL" || (filters.blocker === "BLOCKED" ? row.analysis.confirmedBlockerCount > 0 : row.analysis.confirmedBlockerCount === 0);
    return haystack.includes(query)
      && modeMatch
      && seniorityMatch
      && minimumMatch
      && (!filters.evidenceSufficientOnly || row.analysis.evidenceSufficient)
      && priorityMatch
      && blockerMatch
      && (!filters.withinPreferredArea || row.withinPreferredArea)
      && (!filters.remoteCompatible || row.remoteCompatible);
  });
}

export function formatPostedDate(postedAt: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(postedAt));
}
