import { createHash } from "node:crypto";
import { DEMO_CANDIDATE, type DemoJob, type DemoRequirement, type Dimension, type MatchClass, type PreferredCategory, workModesFor } from "@/lib/demo-contract";

export const SCORER_VERSION = "jobpilot-ai-fit-v2.2";
export const RECEIPT_VERSION = "jobpilot-score-receipt.v2.2";
export const MICRO_POINTS_PER_POINT = 1_000_000;
export const TOTAL_MICRO_POINTS = 100 * MICRO_POINTS_PER_POINT;
export const CORE_BASE_MICRO_POINTS = 85 * MICRO_POINTS_PER_POINT;

const preferredCaps: Record<PreferredCategory, number> = {
  EXPERIENCE: 4_000_000,
  TECHNICAL: 4_000_000,
  ROLE_AND_DOMAIN: 1_500_000,
  CUSTOMER_AND_STAKEHOLDER: 1_500_000,
  EDUCATION_AND_CERTIFICATION: 1_000_000,
};

const dimensionPriors: Record<Dimension, number> = {
  EXPERIENCE_AND_SENIORITY: 28,
  CORE_TECHNICAL_SKILLS: 30,
  ROLE_AND_DOMAIN: 15,
  CUSTOMER_AND_STAKEHOLDER: 8,
  EDUCATION_AND_CERTIFICATIONS: 4,
};

const necessityMultipliers: Record<string, number> = { MANDATORY: 10_000, REQUIRED: 9_000, RESPONSIBILITY_DERIVED: 7_500 };
const importanceMultipliers: Record<string, number> = { CORE: 15_000, SUPPORTING: 10_000, INCIDENTAL: 5_000 };
const centralityMultipliers: Record<string, number> = { TITLE_OR_ROLE_MISSION: 12_500, REPEATED_ACROSS_RESPONSIBILITIES: 11_500, SINGLE_EXPLICIT_REQUIREMENT: 10_000, SUPPORTING_CONTEXT: 7_500 };

export const MATCH_INTERVALS: Record<Exclude<MatchClass, "UNKNOWN" | "NOT_APPLICABLE">, { low: number; mid: number; high: number }> = {
  MATCHED: { low: 10_000, mid: 10_000, high: 10_000 },
  STRONG_EQUIVALENT: { low: 8_000, mid: 9_000, high: 9_500 },
  PARTIAL: { low: 3_500, mid: 5_500, high: 7_000 },
  WEAK: { low: 1_000, mid: 2_500, high: 4_000 },
  NOT_EVIDENCED: { low: 0, mid: 0, high: 0 },
  EXPLICIT_CONFLICT: { low: 0, mid: 0, high: 0 },
};

export type CapabilityScore = DemoRequirement & {
  maximumMicroPoints: number;
  earnedLowMicroPoints: number;
  earnedMidMicroPoints: number;
  earnedHighMicroPoints: number;
  pointsLostMicroPoints: number;
  verifierStatus: "VALIDATED";
  uncertainty: string;
};

export type PracticalConstraint = {
  id: "WORK_MODE" | "LOCATION" | "TRAVEL";
  label: string;
  status: "MATCH" | "CONFLICT" | "UNKNOWN" | "NO_EXPLICIT_PREFERENCE";
  blocker: boolean;
  explanation: string;
};

export type ScoreAnalysis = {
  analysisId: string;
  analysisStatus: "COMPLETE" | "INSUFFICIENT_EVIDENCE";
  numericScoreEligibility: boolean;
  ineligibilityReasons: string[];
  displayedScore: number | null;
  scoreRange: { low: number; mid: number; high: number } | null;
  evidenceQuality: number;
  evidenceQualityFactors: Record<string, number>;
  applyPriority: "HIGH" | "MEDIUM" | "LOW" | "CONFIRMED_CONSTRAINT" | "NEEDS_REVIEW";
  applyPriorityRule: string;
  confirmedBlockerCount: number;
  classTotals: {
    core: ClassTotal;
    preferred: ClassTotal;
    niceToHave: ClassTotal;
    totalMaximumMicroPoints: number;
    totalEarnedLowMicroPoints: number;
    totalEarnedMidMicroPoints: number;
    totalEarnedHighMicroPoints: number;
  };
  budgetTransfers: { unusedPreferredToCoreMicroPoints: number; unusedNiceToCoreMicroPoints: number };
  capabilityGroups: CapabilityScore[];
  practicalConstraints: PracticalConstraint[];
  hiddenAdjustments: 0;
  receipt: ScoreReceipt;
};

type ClassTotal = { maximumMicroPoints: number; earnedLowMicroPoints: number; earnedMidMicroPoints: number; earnedHighMicroPoints: number };
export type ScoreReceipt = Record<string, unknown> & { receiptHash: string };

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stableValue(item)]));
  return value;
}

export function stableStringify(value: unknown) {
  return JSON.stringify(stableValue(value));
}

export function sha256(value: unknown) {
  return createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");
}

function roundDivide(numerator: bigint, denominator: bigint) {
  return Number((numerator + denominator / 2n) / denominator);
}

function relativeWeight(requirement: DemoRequirement) {
  const necessity = necessityMultipliers[requirement.necessity] ?? 10_000;
  const importance = importanceMultipliers[requirement.importance] ?? 10_000;
  const centrality = centralityMultipliers[requirement.centrality] ?? 10_000;
  return BigInt(necessity) * BigInt(importance) * BigInt(centrality) * BigInt(dimensionPriors[requirement.dimension]);
}

type AllocationItem = { id: string; weight: bigint; cap?: number };
export function largestRemainderAllocate(total: number, inputs: AllocationItem[]) {
  const result = new Map(inputs.map((item) => [item.id, 0]));
  let remaining = total;
  let active = [...inputs].sort((a, b) => a.id.localeCompare(b.id));
  while (remaining > 0 && active.length) {
    const totalWeight = active.reduce((sum, item) => sum + item.weight, 0n);
    if (totalWeight === 0n) throw new Error("Allocation weights must be positive.");
    const shares = active.map((item) => {
      const numerator = BigInt(remaining) * item.weight;
      return { item, floor: Number(numerator / totalWeight), remainder: numerator % totalWeight };
    });
    const capped = shares.filter(({ item, floor }) => item.cap !== undefined && (result.get(item.id) ?? 0) + floor > item.cap);
    if (capped.length) {
      for (const { item } of capped) {
        const current = result.get(item.id) ?? 0;
        const capacity = Math.max(0, (item.cap ?? current) - current);
        result.set(item.id, current + capacity);
        remaining -= capacity;
      }
      const cappedIds = new Set(capped.map(({ item }) => item.id));
      active = active.filter((item) => !cappedIds.has(item.id));
      continue;
    }
    let distributed = 0;
    for (const { item, floor } of shares) {
      result.set(item.id, (result.get(item.id) ?? 0) + floor);
      distributed += floor;
    }
    let leftover = remaining - distributed;
    for (const { item } of [...shares].sort((a, b) => a.remainder === b.remainder ? a.item.id.localeCompare(b.item.id) : a.remainder > b.remainder ? -1 : 1)) {
      if (!leftover) break;
      const current = result.get(item.id) ?? 0;
      if (item.cap === undefined || current < item.cap) {
        result.set(item.id, current + 1);
        leftover -= 1;
      }
    }
    remaining = leftover;
    if (leftover === 0) break;
    active = active.filter((item) => item.cap === undefined || (result.get(item.id) ?? 0) < item.cap);
  }
  if (remaining !== 0) throw new Error("The visible class budget could not be allocated within concentration controls.");
  return result;
}

function matchEarnings(maximum: number, matchClass: MatchClass) {
  if (matchClass === "UNKNOWN" || matchClass === "NOT_APPLICABLE") return { low: 0, mid: 0, high: 0 };
  const interval = MATCH_INTERVALS[matchClass];
  return {
    low: roundDivide(BigInt(maximum) * BigInt(interval.low), 10_000n),
    mid: roundDivide(BigInt(maximum) * BigInt(interval.mid), 10_000n),
    high: roundDivide(BigInt(maximum) * BigInt(interval.high), 10_000n),
  };
}

function classTotal(groups: CapabilityScore[], scoringClass: DemoRequirement["scoringClass"]): ClassTotal {
  const filtered = groups.filter((group) => group.scoringClass === scoringClass);
  return {
    maximumMicroPoints: filtered.reduce((sum, group) => sum + group.maximumMicroPoints, 0),
    earnedLowMicroPoints: filtered.reduce((sum, group) => sum + group.earnedLowMicroPoints, 0),
    earnedMidMicroPoints: filtered.reduce((sum, group) => sum + group.earnedMidMicroPoints, 0),
    earnedHighMicroPoints: filtered.reduce((sum, group) => sum + group.earnedHighMicroPoints, 0),
  };
}

export function evaluatePracticalConstraints(job: DemoJob): PracticalConstraint[] {
  const acceptedModes = new Set(DEMO_CANDIDATE.preferences.acceptedWorkModes);
  const modes = workModesFor(job);
  const modeMatch = modes.some((mode) => acceptedModes.has(mode as "REMOTE" | "HYBRID"));
  const travelConflict = job.travelPercent > DEMO_CANDIDATE.preferences.maximumTravelPercent;
  return [
    { id: "WORK_MODE", label: `Available: ${modes.join(", ")}`, status: modeMatch ? "MATCH" : "CONFLICT", blocker: !modeMatch, explanation: modeMatch ? "At least one known job mode intersects the synthetic profile's explicit accepted modes." : "Known job modes do not intersect the synthetic profile's explicit accepted modes." },
    { id: "LOCATION", label: job.locations.map((location) => location.label).join(" · "), status: "MATCH", blocker: false, explanation: "Location is displayed separately and does not alter technical points." },
    { id: "TRAVEL", label: `${job.travelPercent}% travel`, status: travelConflict ? "CONFLICT" : "MATCH", blocker: travelConflict, explanation: travelConflict ? `The role exceeds the synthetic profile's explicit ${DEMO_CANDIDATE.preferences.maximumTravelPercent}% travel maximum.` : "Travel is within the synthetic profile's explicit preference." },
  ];
}

export function relevantExperienceYears(roles: { startMonth: string; endMonth: string; coefficient: number }[]) {
  const monthly = new Map<string, number>();
  for (const role of roles) {
    const [startYear, startMonth] = role.startMonth.split("-").map(Number);
    const [endYear, endMonth] = role.endMonth.split("-").map(Number);
    let cursor = new Date(Date.UTC(startYear!, startMonth! - 1, 1));
    const end = new Date(Date.UTC(endYear!, endMonth! - 1, 1));
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 7);
      monthly.set(key, Math.max(monthly.get(key) ?? 0, role.coefficient));
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    }
  }
  return [...monthly.values()].reduce((sum, coefficient) => sum + coefficient, 0) / 12;
}

export function experienceMatchBasisPoints(candidateYears: number, requestedYears: number) {
  if (requestedYears <= 0 || candidateYears >= requestedYears) return 10_000;
  return Math.round(Math.pow(candidateYears / requestedYears, 1.5) * 10_000);
}

function evidenceQuality(job: DemoJob, eligible: boolean) {
  const factors = {
    jobExtractionCoverage: eligible ? 0.98 : 0.58,
    candidateProfileCoverage: 0.96,
    evidenceQuoteValidity: 1,
    evidenceOffsetValidity: 1,
    requirementClassificationCoverage: eligible ? 1 : 0.72,
    extractorVerifierAgreement: 0.96,
    modelContractStability: 0.95,
    coreAllocationCoverage: eligible ? 1 : 0.62,
  };
  const weights: Record<keyof typeof factors, number> = { jobExtractionCoverage: 0.18, candidateProfileCoverage: 0.18, evidenceQuoteValidity: 0.14, evidenceOffsetValidity: 0.1, requirementClassificationCoverage: 0.14, extractorVerifierAgreement: 0.1, modelContractStability: 0.08, coreAllocationCoverage: 0.08 };
  const value = 100 * Math.exp(Object.entries(factors).reduce((sum, [key, factor]) => sum + weights[key as keyof typeof factors] * Math.log(Math.max(0.01, factor)), 0));
  return { factors, value: Math.round(value * 10) / 10 };
}

function toPoints(microPoints: number) {
  return Math.round((microPoints / MICRO_POINTS_PER_POINT) * 100) / 100;
}

function receiptFor(job: DemoJob, analysis: Omit<ScoreAnalysis, "receipt">): ScoreReceipt {
  const body = {
    receiptVersion: RECEIPT_VERSION,
    analysisId: analysis.analysisId,
    analysisStatus: analysis.analysisStatus,
    numericScoreEligibility: analysis.numericScoreEligibility,
    ineligibilityReasons: analysis.ineligibilityReasons,
    jobId: job.id,
    jobContentHash: job.contentHash,
    candidateProfileId: DEMO_CANDIDATE.id,
    candidateProfileHash: sha256(DEMO_CANDIDATE),
    preferenceHash: sha256(DEMO_CANDIDATE.preferences),
    provider: "FIXTURE_ONLY",
    modelTag: "deterministic-synthetic-contract",
    modelSnapshot: null,
    jobPromptVersion: "jobpilot-role-intelligence.v2.2",
    candidatePromptVersion: "jobpilot-candidate-evidence.v2.2",
    matchPromptVersion: "jobpilot-evidence-mapping.v2.2",
    scorerVersion: SCORER_VERSION,
    scoringContractHash: sha256({ coreBase: 85, preferredCaps, niceMaximum: 3, matchIntervals: MATCH_INTERVALS }),
    evidenceContractHash: sha256({ candidateEvidenceIds: DEMO_CANDIDATE.evidence.map((item) => item.id), requirementIds: job.requirements.map((item) => item.id) }),
    totalMaximumMicroPoints: analysis.classTotals.totalMaximumMicroPoints,
    totalEarnedLowMicroPoints: analysis.classTotals.totalEarnedLowMicroPoints,
    totalEarnedMidMicroPoints: analysis.classTotals.totalEarnedMidMicroPoints,
    totalEarnedHighMicroPoints: analysis.classTotals.totalEarnedHighMicroPoints,
    displayedScore: analysis.displayedScore,
    classTotals: analysis.classTotals,
    budgetTransfers: analysis.budgetTransfers,
    evidenceQuality: analysis.evidenceQuality,
    evidenceQualityFactors: analysis.evidenceQualityFactors,
    practicalConstraints: analysis.practicalConstraints,
    blockers: analysis.practicalConstraints.filter((constraint) => constraint.blocker),
    capabilityGroups: analysis.capabilityGroups,
    hiddenAdjustments: 0,
    generatedAt: job.analysisTimestamp,
  };
  return { ...body, receiptHash: sha256(body) };
}

export function scoreJob(job: DemoJob): ScoreAnalysis {
  const core = job.requirements.filter((requirement) => requirement.scoringClass === "CORE");
  const preferred = job.requirements.filter((requirement) => requirement.scoringClass === "PREFERRED");
  const nice = job.requirements.filter((requirement) => requirement.scoringClass === "NICE_TO_HAVE");
  const activeDimensions = new Set(core.map((requirement) => requirement.dimension));
  const unknownCore = core.filter((requirement) => requirement.matchClass === "UNKNOWN").length;
  const ineligibilityReasons: string[] = [];
  if (core.length < 3) ineligibilityReasons.push("At least three independent CORE capability groups are required.");
  if (activeDimensions.size < 2) ineligibilityReasons.push("At least two active CORE dimensions are required.");
  if (core.length && unknownCore / core.length > 0.15) ineligibilityReasons.push("Weighted UNKNOWN CORE evidence exceeds 15%.");

  const preferredByCategory = new Map<PreferredCategory, DemoRequirement[]>();
  for (const category of Object.keys(preferredCaps) as PreferredCategory[]) preferredByCategory.set(category, preferred.filter((requirement) => requirement.preferredCategory === category));
  const preferredMaximum = [...preferredByCategory].reduce((sum, [category, groups]) => sum + (groups.length ? preferredCaps[category] : 0), 0);
  const niceMaximum = Math.min(3_000_000, nice.length * 1_000_000);
  const unusedPreferredToCoreMicroPoints = 12_000_000 - preferredMaximum;
  const unusedNiceToCoreMicroPoints = 3_000_000 - niceMaximum;
  const coreMaximum = CORE_BASE_MICRO_POINTS + unusedPreferredToCoreMicroPoints + unusedNiceToCoreMicroPoints;
  const numericScoreEligibility = ineligibilityReasons.length === 0 && coreMaximum <= core.length * 32_500_000;
  if (!numericScoreEligibility && ineligibilityReasons.length === 0) ineligibilityReasons.push("The CORE budget cannot be allocated without violating concentration controls.");

  const maxima = new Map<string, number>();
  if (numericScoreEligibility) {
    const coreAllocation = largestRemainderAllocate(coreMaximum, core.map((requirement) => ({ id: requirement.capabilityGroupId, weight: relativeWeight(requirement), cap: 32_500_000 })));
    for (const [id, value] of coreAllocation) maxima.set(id, value);
    for (const [category, groups] of preferredByCategory) {
      if (!groups.length) continue;
      const allocation = largestRemainderAllocate(preferredCaps[category], groups.map((requirement) => ({ id: requirement.capabilityGroupId, weight: BigInt((importanceMultipliers[requirement.importance] ?? 10_000) * (centralityMultipliers[requirement.centrality] ?? 10_000)) })));
      for (const [id, value] of allocation) maxima.set(id, value);
    }
    for (const requirement of nice) maxima.set(requirement.capabilityGroupId, 1_000_000);
  }

  const capabilityGroups: CapabilityScore[] = job.requirements.map((requirement) => {
    const maximumMicroPoints = maxima.get(requirement.capabilityGroupId) ?? 0;
    const earned = matchEarnings(maximumMicroPoints, requirement.matchClass);
    return {
      ...requirement,
      maximumMicroPoints,
      earnedLowMicroPoints: earned.low,
      earnedMidMicroPoints: earned.mid,
      earnedHighMicroPoints: earned.high,
      pointsLostMicroPoints: maximumMicroPoints - earned.mid,
      verifierStatus: "VALIDATED",
      uncertainty: requirement.matchClass === "UNKNOWN" ? "Candidate evidence is not sufficient to classify this requirement." : requirement.matchClass === "STRONG_EQUIVALENT" || requirement.matchClass === "PARTIAL" || requirement.matchClass === "WEAK" ? "Semantic equivalence creates the displayed score range." : "No material match uncertainty in the frozen fixture.",
    };
  });
  const coreTotal = classTotal(capabilityGroups, "CORE");
  const preferredTotal = classTotal(capabilityGroups, "PREFERRED");
  const niceTotal = classTotal(capabilityGroups, "NICE_TO_HAVE");
  const classTotals = {
    core: coreTotal,
    preferred: preferredTotal,
    niceToHave: niceTotal,
    totalMaximumMicroPoints: coreTotal.maximumMicroPoints + preferredTotal.maximumMicroPoints + niceTotal.maximumMicroPoints,
    totalEarnedLowMicroPoints: coreTotal.earnedLowMicroPoints + preferredTotal.earnedLowMicroPoints + niceTotal.earnedLowMicroPoints,
    totalEarnedMidMicroPoints: coreTotal.earnedMidMicroPoints + preferredTotal.earnedMidMicroPoints + niceTotal.earnedMidMicroPoints,
    totalEarnedHighMicroPoints: coreTotal.earnedHighMicroPoints + preferredTotal.earnedHighMicroPoints + niceTotal.earnedHighMicroPoints,
  };
  const practicalConstraints = evaluatePracticalConstraints(job);
  const confirmedBlockerCount = practicalConstraints.filter((constraint) => constraint.blocker).length;
  const quality = evidenceQuality(job, numericScoreEligibility);
  const displayedScore = numericScoreEligibility ? Math.round(classTotals.totalEarnedMidMicroPoints / MICRO_POINTS_PER_POINT) : null;
  const scoreRange = numericScoreEligibility ? { low: toPoints(classTotals.totalEarnedLowMicroPoints), mid: toPoints(classTotals.totalEarnedMidMicroPoints), high: toPoints(classTotals.totalEarnedHighMicroPoints) } : null;
  let applyPriority: ScoreAnalysis["applyPriority"];
  let applyPriorityRule: string;
  if (confirmedBlockerCount) { applyPriority = "CONFIRMED_CONSTRAINT"; applyPriorityRule = "A validated practical blocker exists."; }
  else if (!numericScoreEligibility || quality.value < 70) { applyPriority = "NEEDS_REVIEW"; applyPriorityRule = "The numeric score is ineligible or Evidence Quality is below 70."; }
  else if ((displayedScore ?? 0) >= 75) { applyPriority = "HIGH"; applyPriorityRule = "Fit Score is at least 75, Evidence Quality is at least 70, and no confirmed blocker exists."; }
  else if ((displayedScore ?? 0) >= 55) { applyPriority = "MEDIUM"; applyPriorityRule = "Fit Score is 55–74, Evidence Quality is at least 70, and no confirmed blocker exists."; }
  else { applyPriority = "LOW"; applyPriorityRule = "Fit Score is below 55, Evidence Quality is at least 70, and no confirmed blocker exists."; }
  const withoutReceipt: Omit<ScoreAnalysis, "receipt"> = {
    analysisId: `analysis-${job.id}-v22`,
    analysisStatus: numericScoreEligibility ? "COMPLETE" : "INSUFFICIENT_EVIDENCE",
    numericScoreEligibility,
    ineligibilityReasons,
    displayedScore,
    scoreRange,
    evidenceQuality: quality.value,
    evidenceQualityFactors: quality.factors,
    applyPriority,
    applyPriorityRule,
    confirmedBlockerCount,
    classTotals,
    budgetTransfers: { unusedPreferredToCoreMicroPoints, unusedNiceToCoreMicroPoints },
    capabilityGroups,
    practicalConstraints,
    hiddenAdjustments: 0,
  };
  return { ...withoutReceipt, receipt: receiptFor(job, withoutReceipt) };
}
