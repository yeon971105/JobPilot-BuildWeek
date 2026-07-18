import type { Dimension, MatchClass, ScoringClass } from "@/lib/demo-contract";
import type { ScoreAnalysis } from "@/server/build-week/scorer";

export function fitPresentation(score: number | null) {
  if (score === null) return { label: "INSUFFICIENT EVIDENCE", tone: "insufficient" } as const;
  if (score >= 75) return { label: "STRONG FIT", tone: "strong" } as const;
  if (score >= 55) return { label: "WORTH REVIEWING", tone: "review" } as const;
  return { label: "LIMITED FIT", tone: "limited" } as const;
}

export function evidencePresentation(value: number) {
  if (value >= 90) return "VERY STRONG EVIDENCE";
  if (value >= 75) return "GOOD EVIDENCE";
  if (value >= 60) return "MIXED EVIDENCE";
  return "LIMITED EVIDENCE";
}

const classOrder: Record<ScoringClass, number> = { CORE: 0, PREFERRED: 2, NICE_TO_HAVE: 4 };
const strongMatchOrder: Partial<Record<MatchClass, number>> = { MATCHED: 0, STRONG_EQUIVALENT: 1 };
const attentionMatchOrder: Partial<Record<MatchClass, number>> = { NOT_EVIDENCED: 0, WEAK: 1, PARTIAL: 2, UNKNOWN: 3, EXPLICIT_CONFLICT: 4 };

export function defaultSummaryGroups(analysis: ScoreAnalysis) {
  const strong = analysis.capabilityGroups
    .filter((item) => item.matchClass === "MATCHED" || item.matchClass === "STRONG_EQUIVALENT")
    .sort((left, right) => (classOrder[left.scoringClass] + (strongMatchOrder[left.matchClass] ?? 9)) - (classOrder[right.scoringClass] + (strongMatchOrder[right.matchClass] ?? 9))
      || right.maximumMicroPoints - left.maximumMicroPoints
      || left.capabilityGroupId.localeCompare(right.capabilityGroupId))
    .slice(0, 3);
  const attention = analysis.capabilityGroups
    .filter((item) => ["PARTIAL", "WEAK", "NOT_EVIDENCED", "UNKNOWN", "EXPLICIT_CONFLICT"].includes(item.matchClass))
    .sort((left, right) => (classOrder[left.scoringClass] + (attentionMatchOrder[left.matchClass] ?? 9)) - (classOrder[right.scoringClass] + (attentionMatchOrder[right.matchClass] ?? 9))
      || left.capabilityGroupId.localeCompare(right.capabilityGroupId))
    .slice(0, 3);
  return { strong, attention };
}

const dimensionLabels: Record<Dimension, { label: string; explanation: string }> = {
  CORE_TECHNICAL_SKILLS: { label: "Technical Skills", explanation: "How directly your technical evidence supports active role requirements." },
  EXPERIENCE_AND_SENIORITY: { label: "Relevant Experience", explanation: "How your relevant delivery history compares with active experience requirements." },
  ROLE_AND_DOMAIN: { label: "Role and Domain", explanation: "How closely your demonstrated work maps to this role and domain." },
  CUSTOMER_AND_STAKEHOLDER: { label: "Customer and Stakeholder", explanation: "How your collaboration evidence supports the role’s partner-facing work." },
  EDUCATION_AND_CERTIFICATIONS: { label: "Education and Certifications", explanation: "How education or equivalent evidence supports active requirements." },
};

export function dimensionMap(analysis: ScoreAnalysis) {
  return (Object.keys(dimensionLabels) as Dimension[]).map((dimension) => {
    const items = analysis.capabilityGroups.filter((item) => item.dimension === dimension && item.maximumMicroPoints > 0);
    const maximum = items.reduce((sum, item) => sum + item.maximumMicroPoints, 0);
    const earned = items.reduce((sum, item) => sum + item.earnedMidMicroPoints, 0);
    const percent = maximum ? Math.round((earned / maximum) * 100) : null;
    const strength = percent === null ? "Not assessed" : percent >= 85 ? "Strong" : percent >= 65 ? "Good" : percent >= 40 ? "Mixed" : percent >= 1 ? "Limited" : "No evidence found";
    return { dimension, ...dimensionLabels[dimension], activeRequirementCount: items.length, percent, strength };
  });
}

export function plainEvidenceState(matchClass: MatchClass) {
  if (matchClass === "MATCHED" || matchClass === "STRONG_EQUIVALENT") return "Strong evidence";
  if (matchClass === "PARTIAL" || matchClass === "WEAK") return "Some evidence";
  if (matchClass === "NOT_EVIDENCED") return "No evidence found";
  return "Needs review";
}
