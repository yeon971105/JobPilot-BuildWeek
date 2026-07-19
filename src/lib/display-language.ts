import { DEMO_CANDIDATE, DEMO_JOBS, type MatchClass, type ScoringClass } from "@/lib/demo-contract";

const requirementLabels = new Map(
  DEMO_JOBS.flatMap((job) =>
    job.requirements.flatMap((requirement) => [
      [requirement.id, requirement.canonicalName] as const,
      [requirement.capabilityGroupId, requirement.canonicalName] as const,
    ]),
  ),
);

const evidenceLabels = new Map(DEMO_CANDIDATE.evidence.map((item) => [item.id, item.label] as const));

const knownLabels: Readonly<Record<string, string>> = {
  "r-ha-sql": "SQL analysis",
  "r-ha-metrics": "Product metric design",
  "r-ha-communication": "Decision communication",
  "e-product": "Product analytics experience",
  "e-python": "Python engineering experience",
  MATCHED: "Strong evidence",
  STRONG_EQUIVALENT: "Strong comparable evidence",
  PARTIAL: "Some evidence",
  WEAK: "Limited evidence",
  NOT_EVIDENCED: "No evidence found",
  EXPLICIT_CONFLICT: "Conflicting evidence",
  UNKNOWN: "Needs clarification",
  NOT_APPLICABLE: "Not applicable",
  CORE: "Core requirement",
  PREFERRED: "Preferred qualification",
  NICE_TO_HAVE: "Helpful extra",
  HIGH: "High importance",
  MEDIUM: "Medium importance",
  LOW: "Low importance",
  WORK_MODE: "Work arrangement",
  LOCATION: "Location",
  TRAVEL: "Travel",
  RAW_POSTING: "Traditional Posting",
  JOBPILOT: "JobPilot",
  APPLY: "Apply",
  REVIEW_FURTHER: "Review Further",
  SKIP: "Skip",
};

const acronymLabels: Readonly<Record<string, string>> = {
  ai: "AI",
  api: "API",
  ml: "ML",
  python: "Python",
  sql: "SQL",
  ui: "UI",
  ux: "UX",
};

function humanizeToken(token: string) {
  const normalized = token.toLowerCase();
  return acronymLabels[normalized] ?? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

export function humanizeMachineValue(value: string | null | undefined, fallback = "Not available") {
  if (!value?.trim()) return fallback;
  const known = knownLabels[value];
  if (known) return known;
  const withoutPrefix = value
    .trim()
    .replace(/^(?:analysis|cg|r|e)-[a-z0-9]+-/i, "")
    .replace(/^(?:analysis|cg|r|e)-/i, "");
  const tokens = withoutPrefix.split(/[-_\s]+/).filter(Boolean);
  if (!tokens.length) return fallback;
  const label = tokens.map(humanizeToken).join(" ");
  return label === value ? fallback : label;
}

export function getRequirementDisplayLabel(id: string | null | undefined, canonicalTitle?: string | null) {
  return canonicalTitle?.trim() || (id ? requirementLabels.get(id) : undefined) || humanizeMachineValue(id, "Role requirement");
}

export function getEvidenceDisplayLabel(id: string | null | undefined, canonicalTitle?: string | null) {
  return canonicalTitle?.trim() || (id ? evidenceLabels.get(id) : undefined) || humanizeMachineValue(id, "Candidate evidence");
}

export function getMatchDisplayLabel(value: MatchClass | string | null | undefined) {
  return humanizeMachineValue(value, "Evidence status unavailable");
}

export function getRequirementClassDisplayLabel(value: ScoringClass | string | null | undefined) {
  return humanizeMachineValue(value, "Requirement class unavailable");
}

export function getDecisionDisplayLabel(value: string | null | undefined) {
  return humanizeMachineValue(value, "No decision recorded");
}

export function getConditionDisplayLabel(value: string | null | undefined) {
  return humanizeMachineValue(value, "Study condition");
}

export const MACHINE_ID_PATTERN = /\b(?:r|e|cg|analysis)-[a-z0-9-]+\b/gi;
export const RAW_MACHINE_ENUM_PATTERN = /\b(?:MATCHED|STRONG_EQUIVALENT|PARTIAL|WEAK|NOT_EVIDENCED|EXPLICIT_CONFLICT|UNKNOWN|NOT_APPLICABLE|CORE|PREFERRED|NICE_TO_HAVE)\b/g;
