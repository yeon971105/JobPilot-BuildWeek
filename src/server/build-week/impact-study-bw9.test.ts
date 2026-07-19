import { describe, expect, it } from "vitest";
import { createDecisionStudySession, DECISION_STUDY_CSV_HEADERS, DECISION_STUDY_ROLES, studySessionToCsv } from "@/lib/decision-study";
import { analyzeImpactStudyCsv, formatStudyCsv, parseStudyCsv, publicImpactSummary } from "@/lib/impact-study";

const HEADER = [...DECISION_STUDY_CSV_HEADERS];

function participantRows(index: number, options: { rawSeconds?: number; jobPilotSeconds?: number; wrongRawRequired?: boolean } = {}) {
  const session = createDecisionStudySession({ randomValue: index % 2 ? .25 : .75, participantEntropy: new Uint32Array([100 + index, 200 + index, 300 + index]), now: new Date("2026-07-18T18:00:00.000Z"), phase: "FINAL", authenticHumanConfirmation: true });
  session.responses = session.responses.map((response, responseIndex) => {
    const key = DECISION_STUDY_ROLES[response.roleId].answerKey;
    return { ...response, ...key, requiredExperienceAnswer: responseIndex === 0 && options.wrongRawRequired ? (key.requiredExperienceAnswer === "THREE_YEARS_ANALYTICS_OPERATIONS" ? "FOUR_YEARS_DATA_PRODUCTS" : "THREE_YEARS_ANALYTICS_OPERATIONS") : key.requiredExperienceAnswer, taskSeconds: responseIndex ? options.jobPilotSeconds ?? 60 : options.rawSeconds ?? 100, confidence: responseIndex ? 6 : 4, clarity: responseIndex ? 6 : 3, completed: true, completedAt: `2026-07-18T18:0${responseIndex}:00.000Z` };
  }) as typeof session.responses;
  return parseStudyCsv(studySessionToCsv(session)).slice(1);
}

function combined(participantCount: number, options?: (index: number) => Parameters<typeof participantRows>[1]) {
  const rows = Array.from({ length: participantCount }, (_, index) => participantRows(index + 1, options?.(index) ?? {})).flat();
  return formatStudyCsv([HEADER, ...rows]);
}

describe("JP-BW11R human impact importer and calculations", () => {
  it("reports READY_NOT_RUN with no invented metrics at n=0", () => {
    const analysis = analyzeImpactStudyCsv(formatStudyCsv([HEADER]));
    expect(analysis.status).toBe("READY_NOT_RUN");
    expect(analysis.humanParticipantCount).toBe(0);
    expect(analysis.bootstrapStatus).toBe("NOT_AVAILABLE_NO_PARTICIPANTS");
    expect(publicImpactSummary(analysis).metrics).toBeNull();
  });

  it("withholds metrics publicly while collection is below the five-person minimum", () => {
    const analysis = analyzeImpactStudyCsv(combined(1));
    expect(analysis.status).toBe("IN_PROGRESS");
    expect(analysis.humanParticipantCount).toBe(1);
    expect(analysis.bootstrapStatus).toBe("NOT_AVAILABLE_BELOW_MINIMUM");
    expect(publicImpactSummary(analysis).metrics).toBeNull();
  });

  it("calculates a valid n=5 two-role paired fixture without population inference", () => {
    const analysis = analyzeImpactStudyCsv(combined(5, (index) => ({ rawSeconds: 100 + index * 10, jobPilotSeconds: 50 + index * 10, wrongRawRequired: index >= 3 })), { bootstrapIterations: 250, bootstrapSeed: 41 });
    expect(analysis.status).toBe("COMPLETE_MINIMUM");
    expect(analysis.humanParticipantCount).toBe(5);
    expect(analysis.conditionOrderCounts).toEqual({ RAW_POSTING_THEN_JOBPILOT: 5 });
    expect(analysis.conditions.RAW_POSTING.medianDecisionTimeSeconds).toBe(120);
    expect(analysis.conditions.JOBPILOT.medianDecisionTimeSeconds).toBe(70);
    expect(analysis.conditions.RAW_POSTING.requiredExperienceAccuracyPercent).toBe(60);
    expect(analysis.conditions.JOBPILOT.requiredExperienceAccuracyPercent).toBe(100);
    expect(analysis.paired.medianTimeDifferenceSecondsJobPilotMinusRaw).toBe(-50);
    expect(analysis.bootstrapStatus).toBe("NOT_RUN_DIRECTIONAL_SAMPLE");
    expect(analysis.bootstrapConfidenceIntervals).toBeNull();
    expect(analysis.statisticalSignificanceClaim).toBe(false);
    expect(publicImpactSummary(analysis).metrics).toMatchObject({ rawPostingMeanSeconds: 120, jobPilotMeanSeconds: 70 });
  });

  it("accepts repeated export headers but rejects duplicate and incomplete sessions", () => {
    const pair = participantRows(1);
    expect(analyzeImpactStudyCsv(formatStudyCsv([HEADER, pair[0]!, HEADER, pair[1]!])).humanParticipantCount).toBe(1);
    expect(() => analyzeImpactStudyCsv(formatStudyCsv([HEADER, ...pair, pair[0]!]))).toThrow(/Duplicate participant-condition/);
    expect(() => analyzeImpactStudyCsv(formatStudyCsv([HEADER, pair[0]!]))).toThrow(/Incomplete participant session/);
  });

  it("rejects prohibited identifying columns and malformed rows", () => {
    expect(() => analyzeImpactStudyCsv(formatStudyCsv([[...HEADER, "email"]]))).toThrow(/prohibited identifying column/);
    expect(() => analyzeImpactStudyCsv(formatStudyCsv([HEADER, [...participantRows(1)[0]!, "extra"]]))).toThrow(/malformed row/);
  });
});
