import { describe, expect, it } from "vitest";
import {
  DECISION_STUDY_CONSENT_VERSION,
  DECISION_STUDY_CSV_HEADERS,
} from "@/lib/decision-study";
import { analyzeImpactStudyCsv, publicImpactSummary } from "@/lib/impact-study";

const HEADER = DECISION_STUDY_CSV_HEADERS.join(",");
const CORRECT = {
  required: "NO_NUMERIC_REQUIRED_EXPERIENCE",
  preferred: "THREE_YEARS_RELEVANT_DELIVERY",
  work: "HYBRID_AND_REMOTE",
  gap: "APPLIED_AI_WORKFLOW_DELIVERY",
} as const;
const WRONG = {
  required: "FIVE_YEARS_APPLIED_AI",
  preferred: "NO_NUMERIC_PREFERRED_EXPERIENCE",
  work: "REMOTE_ONLY",
  gap: "MODERN_PYTHON_ENGINEERING",
} as const;

type FixtureRow = {
  participant: string;
  order: "RAW_POSTING_THEN_JOBPILOT" | "JOBPILOT_THEN_RAW_POSTING";
  condition: "RAW_POSTING" | "JOBPILOT";
  seconds: number;
  required: string;
  preferred: string;
  work: string;
  gap: string;
  decision: "APPLY" | "REVIEW" | "SKIP";
  confidence: number;
  transparency: number;
};

function csvRow(row: FixtureRow) {
  return [
    row.participant,
    row.order,
    row.condition,
    row.seconds,
    row.required,
    row.preferred,
    row.work,
    row.gap,
    row.decision,
    row.confidence,
    row.transparency,
    DECISION_STUDY_CONSENT_VERSION,
    "2026-07-18T18:00:00.000Z",
    false,
  ].join(",");
}

function participantRows(index: number, overrides: Partial<Record<"raw" | "jobPilot", Partial<FixtureRow>>> = {}) {
  const participant = `anon-synthetic-test-fixture-${index}`;
  const order = index % 2 ? "RAW_POSTING_THEN_JOBPILOT" : "JOBPILOT_THEN_RAW_POSTING";
  const base: Omit<FixtureRow, "condition" | "seconds" | "decision" | "confidence" | "transparency"> = {
    participant,
    order,
    ...CORRECT,
  };
  return [
    csvRow({ ...base, condition: "RAW_POSTING", seconds: 100, decision: "REVIEW", confidence: 4, transparency: 3, ...overrides.raw }),
    csvRow({ ...base, condition: "JOBPILOT", seconds: 60, decision: "REVIEW", confidence: 6, transparency: 6, ...overrides.jobPilot }),
  ];
}

describe("JP-BW9 human impact importer and calculations", () => {
  it("reports READY_NOT_RUN with no invented metrics at n=0", () => {
    const analysis = analyzeImpactStudyCsv(`${HEADER}\n`);
    const publicSummary = publicImpactSummary(analysis);
    expect(analysis.status).toBe("READY_NOT_RUN");
    expect(analysis.humanParticipantCount).toBe(0);
    expect(analysis.bootstrapStatus).toBe("NOT_AVAILABLE_NO_PARTICIPANTS");
    expect(analysis.bootstrapConfidenceIntervals).toBeNull();
    expect(publicSummary.metrics).toBeNull();
    expect(publicSummary.fabricatedParticipants).toBe(0);
  });

  it("withholds metrics publicly while collection is below the five-person minimum", () => {
    const csv = [HEADER, ...participantRows(1)].join("\n");
    const analysis = analyzeImpactStudyCsv(csv);
    expect(analysis.status).toBe("IN_PROGRESS");
    expect(analysis.humanParticipantCount).toBe(1);
    expect(analysis.bootstrapStatus).toBe("NOT_AVAILABLE_BELOW_MINIMUM");
    expect(publicImpactSummary(analysis).metrics).toBeNull();
  });

  it("calculates the frozen n=5 paired fixture and deterministic bootstrap intervals", () => {
    const fixtures: Array<[Partial<FixtureRow>, Partial<FixtureRow>]> = [
      [{ seconds: 100, decision: "APPLY", confidence: 3, transparency: 2 }, { seconds: 50, decision: "APPLY", confidence: 6, transparency: 6 }],
      [{ seconds: 110, decision: "REVIEW", confidence: 4, transparency: 3, required: WRONG.required, preferred: WRONG.preferred, work: WRONG.work }, { seconds: 70, decision: "REVIEW", confidence: 6, transparency: 5 }],
      [{ seconds: 120, decision: "SKIP", confidence: 3, transparency: 4, preferred: WRONG.preferred, gap: WRONG.gap }, { seconds: 80, decision: "REVIEW", confidence: 5, transparency: 6, preferred: WRONG.preferred }],
      [{ seconds: 130, decision: "APPLY", confidence: 5, transparency: 3, required: WRONG.required, work: WRONG.work, gap: WRONG.gap }, { seconds: 90, decision: "APPLY", confidence: 6, transparency: 6, work: WRONG.work }],
      [{ seconds: 140, decision: "REVIEW", confidence: 2, transparency: 3, preferred: WRONG.preferred, gap: WRONG.gap }, { seconds: 100, decision: "SKIP", confidence: 7, transparency: 7 }],
    ];
    const rows = fixtures.flatMap(([raw, jobPilot], index) => participantRows(index + 1, { raw, jobPilot }));
    const analysis = analyzeImpactStudyCsv([HEADER, ...rows].join("\n"), { bootstrapIterations: 250, bootstrapSeed: 41 });

    expect(analysis.status).toBe("COMPLETE_MINIMUM");
    expect(analysis.humanParticipantCount).toBe(5);
    expect(analysis.conditionOrderCounts).toEqual({ RAW_POSTING_THEN_JOBPILOT: 3, JOBPILOT_THEN_RAW_POSTING: 2 });
    expect(analysis.conditions.RAW_POSTING).toMatchObject({
      medianDecisionTimeSeconds: 120,
      requiredExperienceAccuracyPercent: 60,
      preferredExperienceAccuracyPercent: 40,
      workModeAccuracyPercent: 60,
      biggestGapAccuracyPercent: 40,
      meanConfidence: 3.4,
      meanTransparency: 3,
    });
    expect(analysis.conditions.JOBPILOT).toMatchObject({
      medianDecisionTimeSeconds: 80,
      requiredExperienceAccuracyPercent: 100,
      preferredExperienceAccuracyPercent: 80,
      workModeAccuracyPercent: 80,
      biggestGapAccuracyPercent: 100,
      meanConfidence: 6,
      meanTransparency: 6,
    });
    expect(analysis.paired).toEqual({
      medianTimeDifferenceSecondsJobPilotMinusRaw: -40,
      medianPercentageTimeChangeJobPilotVsRaw: -33.33,
      requiredExperienceAccuracyDifferencePoints: 40,
      preferredExperienceAccuracyDifferencePoints: 40,
      workModeAccuracyDifferencePoints: 20,
      biggestGapAccuracyDifferencePoints: 60,
      decisionAgreementPercent: 60,
      meanConfidenceDifferenceJobPilotMinusRaw: 2.6,
      meanTransparencyDifferenceJobPilotMinusRaw: 3,
    });
    expect(analysis.bootstrapStatus).toBe("AVAILABLE");
    expect(Object.keys(analysis.bootstrapConfidenceIntervals ?? {}).sort()).toEqual(Object.keys(analysis.paired).sort());
    expect(analysis.bootstrapConfidenceIntervals?.medianTimeDifferenceSecondsJobPilotMinusRaw.iterations).toBe(250);
    expect(analysis.statisticalSignificanceClaim).toBe(false);
    expect(publicImpactSummary(analysis).metrics).not.toBeNull();
  });

  it("accepts repeated export headers but rejects duplicate and incomplete sessions", () => {
    const pair = participantRows(1);
    expect(analyzeImpactStudyCsv([HEADER, pair[0], HEADER, pair[1]].join("\n")).humanParticipantCount).toBe(1);
    expect(() => analyzeImpactStudyCsv([HEADER, ...pair, pair[0]].join("\n"))).toThrow(/Duplicate participant-condition/);
    expect(() => analyzeImpactStudyCsv([HEADER, pair[0]].join("\n"))).toThrow(/Incomplete participant session/);
  });

  it("rejects prohibited identifying columns and malformed rows", () => {
    expect(() => analyzeImpactStudyCsv(`${HEADER},email\n`)).toThrow(/prohibited identifying column/);
    expect(() => analyzeImpactStudyCsv([HEADER, `${participantRows(1)[0]},extra`].join("\n"))).toThrow(/malformed row/);
  });
});
