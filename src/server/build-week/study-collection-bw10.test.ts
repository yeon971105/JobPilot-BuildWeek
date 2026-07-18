import { describe, expect, it } from "vitest";
import { DECISION_STUDY_CONSENT_VERSION, DECISION_STUDY_CSV_HEADERS, studyCollectionState } from "@/lib/decision-study";
import { formatStudyCsv } from "@/lib/impact-study";
import { validateStudyInbox } from "@/lib/study-collection";

const answer = {
  required: "NO_NUMERIC_REQUIRED_EXPERIENCE",
  preferred: "THREE_YEARS_RELEVANT_DELIVERY",
  work: "HYBRID_AND_REMOTE",
  gap: "APPLIED_AI_WORKFLOW_DELIVERY",
};

function participantFile(index: number, changes: { synthetic?: boolean; conditions?: string[]; consent?: string; extraHeader?: string } = {}) {
  const participant = `anon-authentic-fixture-${index}`;
  const order = index % 2 ? "RAW_POSTING_THEN_JOBPILOT" : "JOBPILOT_THEN_RAW_POSTING";
  const conditions = changes.conditions ?? ["RAW_POSTING", "JOBPILOT"];
  const headers = [...DECISION_STUDY_CSV_HEADERS, ...(changes.extraHeader ? [changes.extraHeader] : [])];
  const rows = conditions.map((condition, conditionIndex) => [
    participant,
    order,
    condition,
    String(conditionIndex ? 60 : 100),
    answer.required,
    answer.preferred,
    answer.work,
    answer.gap,
    "REVIEW",
    conditionIndex ? "6" : "4",
    conditionIndex ? "6" : "3",
    changes.consent ?? DECISION_STUDY_CONSENT_VERSION,
    `2026-07-18T18:0${conditionIndex}:00.000Z`,
    String(changes.synthetic ?? false),
    ...(changes.extraHeader ? ["forbidden"] : []),
  ]);
  return { name: `participant-${index}.csv`, contents: formatStudyCsv([headers, ...rows]) };
}

describe("JP-BW10 authentic Decision Utility collection boundary", () => {
  it("keeps an empty inbox valid and READY_NOT_RUN", () => {
    const result = validateStudyInbox([]);
    expect(result).toMatchObject({ valid: true, status: "READY_NOT_RUN", completeParticipantCount: 0, humanRowCount: 0, dryRunRowsCountedAsHumans: 0 });
    expect(result.combinedCsv).toContain("participant_id");
  });

  it("combines only complete two-condition participant exports", () => {
    const result = validateStudyInbox([participantFile(2), participantFile(1)]);
    expect(result).toMatchObject({ valid: true, status: "IN_PROGRESS", completeParticipantCount: 2, humanRowCount: 4 });
    expect(result.acceptedFiles.map((file) => file.participantId)).toEqual(["anon-authentic-fixture-1", "anon-authentic-fixture-2"]);
  });

  it("uses the minimum and preferred state thresholds exactly", () => {
    expect(studyCollectionState(0)).toBe("READY_NOT_RUN");
    expect(studyCollectionState(4)).toBe("IN_PROGRESS");
    expect(studyCollectionState(5)).toBe("COMPLETE_MINIMUM");
    expect(studyCollectionState(7)).toBe("COMPLETE_MINIMUM");
    expect(studyCollectionState(8)).toBe("COMPLETE_PREFERRED");
  });

  it("rejects dry-run rows instead of silently counting or combining them", () => {
    const result = validateStudyInbox([participantFile(1, { synthetic: true })]);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/dry-run, synthetic/);
    expect(result.completeParticipantCount).toBe(0);
    expect(result.dryRunRowsCountedAsHumans).toBe(0);
    expect(result.combinedCsv).toBeNull();
  });

  it("rejects incomplete, duplicate, consent-mismatched, and identifying exports", () => {
    expect(validateStudyInbox([participantFile(1, { conditions: ["RAW_POSTING"] })]).errors.join(" ")).toMatch(/exactly two/);
    expect(validateStudyInbox([participantFile(1), participantFile(1)]).errors.join(" ")).toMatch(/duplicates participant/);
    expect(validateStudyInbox([participantFile(1, { consent: "old-consent" })]).errors.join(" ")).toMatch(/consent version/);
    expect(validateStudyInbox([participantFile(1, { extraHeader: "ip_address" })]).errors.join(" ")).toMatch(/prohibited identifying/);
  });
});
