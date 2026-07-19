import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createDecisionStudySession,
  DECISION_STUDY_CSV_HEADERS,
  DECISION_STUDY_ROLES,
  studyDecisionAlignment,
  studyExportBaseName,
  studyExclusionStatus,
  studySessionToCsv,
  studySessionToJson,
  type DecisionStudySession,
  type StudyMode,
} from "@/lib/decision-study";
import { getEvidenceDisplayLabel, getMatchDisplayLabel, getRequirementClassDisplayLabel, getRequirementDisplayLabel, getStudyAnswerDisplayLabel, humanizeMachineValue } from "@/lib/display-language";
import { parseStudyCsv } from "@/lib/impact-study";
import { validateStudyInbox } from "@/lib/study-collection";

const read = (path: string) => readFileSync(path, "utf8");

function completeSession(phase: StudyMode, authenticHumanConfirmation: boolean): DecisionStudySession {
  const session = createDecisionStudySession({ phase, authenticHumanConfirmation, randomValue: 0.25, participantEntropy: new Uint32Array([12, 34, 56]), now: new Date("2026-07-18T18:00:00.000Z") });
  session.screen = 19;
  session.currentConditionIndex = 2;
  session.comprehensionPassed = true;
  session.responses = session.responses.map((response, index) => {
    const key = DECISION_STUDY_ROLES[response.roleId].answerKey;
    const decision = index ? key.decision : key.decision === "APPLY" ? "REVIEW_FURTHER" : "APPLY";
    return { ...response, requiredExperienceAnswer: key.requiredExperienceAnswer, preferredExperienceAnswer: key.preferredExperienceAnswer, workModeAnswer: key.workModeAnswer, weakestQualificationAnswer: key.weakestQualificationAnswer, decision, correctness: { requiredExperienceAnswer: true, preferredExperienceAnswer: true, workModeAnswer: true, weakestQualificationAnswer: true }, decisionAlignment: decision === key.decision, confidence: 6, clarity: 6, taskSeconds: index ? 92 : 125, completed: true, completedAt: `2026-07-18T18:0${index}:00.000Z` };
  }) as DecisionStudySession["responses"];
  return session;
}

describe("JP-BW12 human-language, prepared-review, and Study export gate", () => {
  it("resolves known identifiers, enums, and unknown IDs without leaking the raw fallback", () => {
    expect(getRequirementDisplayLabel("r-ns-python")).toBe("Modern Python Engineering");
    expect(getRequirementDisplayLabel("r-ha-sql")).toBe("SQL analysis");
    expect(getEvidenceDisplayLabel("e-product")).toBe("Product analytics experience");
    expect(getMatchDisplayLabel("NOT_EVIDENCED")).toBe("No evidence found");
    expect(getRequirementClassDisplayLabel("PREFERRED")).toBe("Preferred qualification");
    expect(getStudyAnswerDisplayLabel("THREE_YEARS_ANALYTICS_OPERATIONS")).toBe("3 years in analytics operations");
    expect(humanizeMachineValue("r-unknown-unmapped-capability")).toBe("Unmapped Capability");
    expect(humanizeMachineValue("r-")).not.toBe("r-");
  });

  it("keeps Application Strategy concise, translated, readable, and progressively disclosed", () => {
    const source = read("src/components/demo/job-detail.tsx");
    for (const heading of ["Application Strategy", "Recommendation", "Why This Role Fits", "What Needs Attention", "What to Emphasize", "Interview Plan", "Questions to Ask", "How This Was Generated", "Limitations", "View supporting evidence", "Technical reference"]) expect(source).toContain(heading);
    expect(source).toContain("max-w-[800px]");
    expect(source).toContain("text-base leading-[1.6]");
    expect(source).toContain("limitWords(rationale, 22)");
    expect(source).toContain("strongestFitEvidence.slice(0, 3)");
    expect(source).toContain("truthfulGaps.slice(0, 2)");
    expect(source).not.toContain("←");
    expect(source).not.toContain("Build Application Strategy");
    expect(source).not.toContain("Why this fit?");
  });

  it.each(["PREVIEW", "PILOT", "FINAL"] as const)("exports a parseable, anonymous %s CSV and JSON contract", (phase) => {
    const session = completeSession(phase, phase === "FINAL");
    const csv = studySessionToCsv(session);
    const rows = parseStudyCsv(csv);
    const json = JSON.parse(studySessionToJson(session)) as { studyPhase: string; exclusionStatus: string; anonymousId: string; assignmentGroup: string; roleIds: string[]; piiFields: unknown[] };
    expect(rows[0]).toEqual([...DECISION_STUDY_CSV_HEADERS]);
    expect(rows).toHaveLength(3);
    expect(json.studyPhase).toBe(phase);
    expect(json.anonymousId).toBe(session.participantId);
    expect(json.assignmentGroup).toBe(session.assignmentGroup);
    expect(new Set(json.roleIds).size).toBe(2);
    expect(json.piiFields).toEqual([]);
    expect(studyExportBaseName(session)).toBe(`jobpilot-study-${phase.toLowerCase()}-${session.participantId}`);
    expect(json.exclusionStatus).toBe(studyExclusionStatus(session));
    expect(csv.toLowerCase()).not.toMatch(/email|phone|resume|home_address|ip_address|demographic|health/);
  });

  it("rejects Preview, Pilot, and browser-test Final exports while accepting an authentic Final schema", () => {
    for (const phase of ["PREVIEW", "PILOT"] as const) {
      const session = completeSession(phase, false);
      expect(validateStudyInbox([{ name: `${phase}.csv`, csvText: studySessionToCsv(session) }]).valid).toBe(false);
    }
    const browserTest = completeSession("FINAL", false);
    expect(studyExclusionStatus(browserTest)).toBe("EXCLUDED_BROWSER_TEST");
    expect(validateStudyInbox([{ name: "browser-test.csv", csvText: studySessionToCsv(browserTest) }]).valid).toBe(false);
    const authentic = completeSession("FINAL", true);
    expect(validateStudyInbox([{ name: "authentic.csv", csvText: studySessionToCsv(authentic) }])).toMatchObject({ valid: true, completeParticipantCount: 1, humanRowCount: 2 });
  });

  it("separates four factual checks from subjective decision alignment", () => {
    const session = completeSession("FINAL", true);
    expect(Object.keys(session.responses[0].correctness)).toHaveLength(4);
    expect(studyDecisionAlignment(session.responses[0])).toBe(false);
    expect(DECISION_STUDY_CSV_HEADERS).not.toContain("decision_correct" as never);
    expect(DECISION_STUDY_CSV_HEADERS).toContain("decision_reference");
    expect(DECISION_STUDY_CSV_HEADERS).toContain("decision_alignment");
    const component = read("src/components/study/decision-utility-study.tsx");
    expect(component).toContain("Decision alignment");
    expect(component).not.toContain('correctness[question.key] ? "Correct" : "Incorrect"');
  });

  it("preserves prepared artifact bytes and the historical video while changing presentation only", () => {
    const expected: Record<string, string> = {
      "build-week/gpt56-prepared/ambiguity-review.json": "9bfc2b4e7a401d0c65817a0451b0c7b1accc0f029c76200d84df42149bd68527",
      "build-week/gpt56-prepared/analysis-challenge.json": "0d6fc734fd3d33aed6dce8d4e041b1a8edcba1d1cb1fabf1f437355b985f6a90",
      "build-week/gpt56-prepared/application-strategy.json": "4e4345f1a99a0fd91739494241fcd5d93d777bf2cfd982401fb660445b3a8c2d",
      "build-week/gpt56-prepared/manifest.json": "ee9e9e3493ebc63486f122a7366724dc0e60c6e971cbde0bb3f07bc164f71bb1",
      "build-week/gpt56-prepared/strategy-comparison.json": "209d40c69b82d28043a4a2011f4c384e5cb94a0c03446e6fba5b803195949791",
      "build-week/video/jobpilot-final-product-rc1.mp4": "82edffe5edaabd4a83fb4a7c9772cb880327aa5a97d624494d897f6b407f2f9a",
    };
    for (const [path, hash] of Object.entries(expected)) expect(createHash("sha256").update(readFileSync(path)).digest("hex")).toBe(hash);
  });
});
