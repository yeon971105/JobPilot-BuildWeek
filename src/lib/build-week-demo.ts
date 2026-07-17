import candidateProfile from "../../build-week/demo-data/candidate-profile.json";
import expectedAnalysis from "../../build-week/demo-data/expected-analysis.json";
import jobs from "../../build-week/demo-data/jobs.json";

export type DemoRequirement = { id: string; label: string; class: "CORE" | "PREFERRED" | "NICE_TO_HAVE"; evidence: string };
export type DemoJob = { id: string; company: string; title: string; location: string; workModes: string[]; travel: string; summary: string; responsibilities: string[]; requirements: DemoRequirement[] };
export type DemoEvidence = { id: string; label: string; text: string };

export const DEMO_CANDIDATE = candidateProfile as typeof candidateProfile & { evidence: DemoEvidence[] };
export const DEMO_JOBS = jobs as DemoJob[];
export const DEMO_ANALYSIS = expectedAnalysis as typeof expectedAnalysis;

export function getDemoJob(id: string) {
  return DEMO_JOBS.find((job) => job.id === id) ?? null;
}

export function getDemoAnalysis(jobId: string) {
  const known = DEMO_ANALYSIS.jobs[jobId as keyof typeof DEMO_ANALYSIS.jobs];
  if (known) return known;
  const job = getDemoJob(jobId);
  if (!job) return null;
  const core = job.requirements.filter((requirement) => requirement.class === "CORE");
  const preferred = job.requirements.filter((requirement) => requirement.class === "PREFERRED");
  const nice = job.requirements.filter((requirement) => requirement.class === "NICE_TO_HAVE");
  const matched = core.slice(0, 2).map((requirement, index) => ({
    requirementId: requirement.id,
    evidenceId: DEMO_CANDIDATE.evidence[index % DEMO_CANDIDATE.evidence.length]!.id,
    status: "PARTIAL",
    earned: 22,
    maximum: 30,
  }));
  return {
    fitScore: 68,
    evidenceQuality: 88,
    scoreRange: [57, 77],
    allocation: { coreMaximum: 85, coreEarned: 58, preferredMaximum: 12, preferredEarned: preferred.length ? 7 : 0, niceMaximum: 3, niceEarned: nice.length ? 3 : 0, totalMaximum: 100, hiddenAdjustment: 0 },
    matches: matched,
    strategyFixture: { recommendation: "REVIEW", rationale: "The synthetic profile shows adjacent evidence. Review the explicit requirements before deciding whether to apply." },
  };
}

export const DEMO_SCORE_LIMITATION = "Policy-based evidence score. Independent hiring-outcome calibration is not yet available.";
