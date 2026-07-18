import { describe, expect, it } from "vitest";
import { createDecisionStudySession, DECISION_STUDY_CSV_HEADERS, DECISION_STUDY_ROLES, studyCollectionState, studySessionToCsv } from "@/lib/decision-study";
import { formatStudyCsv, parseStudyCsv } from "@/lib/impact-study";
import { validateStudyInbox } from "@/lib/study-collection";

type Change = { synthetic?: boolean; dropSecond?: boolean; consent?: string; extraHeader?: string; phase?: string; sameRole?: boolean; authentic?: boolean };

function participantFile(index: number, change: Change = {}) {
  const session = createDecisionStudySession({ randomValue: index % 2 ? .25 : .75, participantEntropy: new Uint32Array([index, index + 1, index + 2]), now: new Date("2026-07-18T18:00:00.000Z"), phase: "FINAL", authenticHumanConfirmation: true });
  session.responses = session.responses.map((response, responseIndex) => {
    const key = DECISION_STUDY_ROLES[response.roleId].answerKey;
    return { ...response, ...key, taskSeconds: responseIndex ? 60 : 100, confidence: responseIndex ? 6 : 4, clarity: responseIndex ? 6 : 3, completed: true, completedAt: `2026-07-18T18:0${responseIndex}:00.000Z` };
  }) as typeof session.responses;
  const rows = parseStudyCsv(studySessionToCsv(session));
  const headers = rows[0]!;
  const indexOf = (name: string) => headers.indexOf(name);
  if (change.dropSecond) rows.splice(2, 1);
  for (const row of rows.slice(1)) {
    if (change.synthetic) row[indexOf("synthetic_tooling_validation")] = "true";
    if (change.consent) row[indexOf("consent_version")] = change.consent;
    if (change.phase) row[indexOf("phase")] = change.phase;
    if (change.authentic === false) row[indexOf("authentic_human_confirmation")] = "false";
  }
  if (change.sameRole && rows[2]) rows[2]![indexOf("role_id")] = rows[1]![indexOf("role_id")]!;
  if (change.extraHeader) { headers.push(change.extraHeader); for (const row of rows.slice(1)) row.push("forbidden"); }
  return { name: `participant-${index}.csv`, csvText: formatStudyCsv(rows) };
}

describe("JP-BW11R authentic Decision Utility V2 collection boundary", () => {
  it("keeps an empty inbox valid and READY_NOT_RUN", () => {
    const result = validateStudyInbox([]);
    expect(result).toMatchObject({ valid: true, status: "READY_NOT_RUN", completeParticipantCount: 0, humanRowCount: 0, dryRunRowsCountedAsHumans: 0 });
    expect(result.combinedCsv).toContain("protocol_version");
  });

  it("combines only complete two-role FINAL participant exports", () => {
    const result = validateStudyInbox([participantFile(2), participantFile(1)]);
    expect(result).toMatchObject({ valid: true, status: "IN_PROGRESS", completeParticipantCount: 2, humanRowCount: 4 });
    expect(result.acceptedFiles).toHaveLength(2);
  });

  it("uses the minimum and preferred state thresholds exactly", () => {
    expect(studyCollectionState(0)).toBe("READY_NOT_RUN");
    expect(studyCollectionState(4)).toBe("IN_PROGRESS");
    expect(studyCollectionState(5)).toBe("COMPLETE_MINIMUM");
    expect(studyCollectionState(7)).toBe("COMPLETE_MINIMUM");
    expect(studyCollectionState(8)).toBe("COMPLETE_PREFERRED");
  });

  it("rejects preview, pilot, dry-run, same-role, and non-authentic rows", () => {
    for (const file of [participantFile(1, { phase: "PREVIEW" }), participantFile(2, { phase: "PILOT" }), participantFile(3, { synthetic: true }), participantFile(4, { sameRole: true }), participantFile(5, { authentic: false })]) {
      const result = validateStudyInbox([file]);
      expect(result.valid).toBe(false);
      expect(result.completeParticipantCount).toBe(0);
      expect(result.dryRunRowsCountedAsHumans).toBe(0);
    }
  });

  it("rejects incomplete, duplicate, consent-mismatched, and identifying exports", () => {
    expect(validateStudyInbox([participantFile(1, { dropSecond: true })]).errors.join(" ")).toMatch(/exactly two/);
    expect(validateStudyInbox([participantFile(1), participantFile(1)]).errors.join(" ")).toMatch(/duplicates participant/);
    expect(validateStudyInbox([participantFile(1, { consent: "old-consent" })]).errors.join(" ")).toMatch(/consent version/);
    expect(validateStudyInbox([participantFile(1, { extraHeader: "ip_address" })]).errors.join(" ")).toMatch(/prohibited identifying/);
    expect(DECISION_STUDY_CSV_HEADERS).not.toContain("name" as never);
  });
});
