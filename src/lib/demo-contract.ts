import candidateProfile from "../../build-week/demo-data/candidate-profile.json";
import jobs from "../../build-week/demo-data/jobs.json";

export type ScoringClass = "CORE" | "PREFERRED" | "NICE_TO_HAVE";
export type Dimension = "EXPERIENCE_AND_SENIORITY" | "CORE_TECHNICAL_SKILLS" | "ROLE_AND_DOMAIN" | "CUSTOMER_AND_STAKEHOLDER" | "EDUCATION_AND_CERTIFICATIONS";
export type MatchClass = "MATCHED" | "STRONG_EQUIVALENT" | "PARTIAL" | "WEAK" | "NOT_EVIDENCED" | "EXPLICIT_CONFLICT" | "UNKNOWN" | "NOT_APPLICABLE";
export type PreferredCategory = "EXPERIENCE" | "TECHNICAL" | "ROLE_AND_DOMAIN" | "CUSTOMER_AND_STAKEHOLDER" | "EDUCATION_AND_CERTIFICATION";

export type DemoRequirement = {
  id: string;
  capabilityGroupId: string;
  canonicalName: string;
  scoringClass: ScoringClass;
  preferredCategory?: PreferredCategory;
  dimension: Dimension;
  necessity: string;
  importance: string;
  centrality: string;
  jobEvidence: string;
  candidateEvidenceIds: string[];
  matchClass: MatchClass;
  requestedYears?: number;
  experienceDomain?: string;
  aliases: string[];
  examples: string[];
};

export type DemoJob = {
  id: string;
  contentHash: string;
  company: string;
  title: string;
  seniority: string;
  analysisTimestamp: string;
  locations: { label: string; workModes: string[] }[];
  travelPercent: number;
  summary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  requirements: DemoRequirement[];
};

export type DemoEvidence = { id: string; label: string; text: string; capabilities: string[] };
export type DemoCandidate = typeof candidateProfile & { evidence: DemoEvidence[] };

export const DEMO_CANDIDATE = candidateProfile as DemoCandidate;
export const DEMO_JOBS = jobs as DemoJob[];

export function getDemoJob(id: string) {
  return DEMO_JOBS.find((job) => job.id === id) ?? null;
}

export function workModesFor(job: DemoJob) {
  return [...new Set(job.locations.flatMap((location) => location.workModes))].sort();
}

export function primaryLocation(job: DemoJob) {
  return job.locations.map((location) => location.label).join(" · ");
}

export const SCORE_DISCLOSURE = "Fit Score is an evidence-based ranking score, not a hiring probability.";
export const CALIBRATION_DISCLOSURE = "Policy-based evidence score. Independent hiring-outcome calibration is not yet available.";
