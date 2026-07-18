import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { anonymousParticipantId, createDecisionStudySession, DECISION_STUDY_ASSIGNMENTS, DECISION_STUDY_CSV_HEADERS, DECISION_STUDY_PROTOCOL_VERSION, parseDecisionStudySession, randomizedAssignment, studySessionToCsv } from "@/lib/decision-study";

describe("JP-BW11R Decision Utility Study V2 harness", () => {
  it("randomizes between the two valid two-role assignments", () => {
    expect(randomizedAssignment(0.25)).toBe("GROUP_1");
    expect(randomizedAssignment(0.75)).toBe("GROUP_2");
    expect(() => randomizedAssignment(1)).toThrow();
    for (const assignment of Object.values(DECISION_STUDY_ASSIGNMENTS)) {
      expect(new Set(assignment.map((item) => item.roleId)).size).toBe(2);
      expect(assignment.map((item) => item.condition)).toEqual(["RAW_POSTING", "JOBPILOT"]);
    }
  });

  it("creates and validates an anonymous local-only V2 session", () => {
    const entropy = new Uint32Array([1, 2, 3]);
    const session = createDecisionStudySession({ randomValue: 0.25, participantEntropy: entropy, now: new Date("2026-07-18T00:00:00.000Z"), phase: "FINAL", authenticHumanConfirmation: true });
    expect(session.participantId).toBe(anonymousParticipantId(entropy));
    expect(session.protocolVersion).toBe(DECISION_STUDY_PROTOCOL_VERSION);
    expect(session.assignmentGroup).toBe("GROUP_1");
    expect(new Set(session.responses.map((item) => item.roleId)).size).toBe(2);
    expect(session.storageMode).toBe("BROWSER_LOCAL_ONLY");
    expect(parseDecisionStudySession(JSON.stringify(session))).toEqual(session);
    expect(parseDecisionStudySession('{"participantId":"name@example.com"}')).toBeNull();
  });

  it("exports only the frozen no-PII V2 schema", () => {
    const session = createDecisionStudySession({ randomValue: 0.75, participantEntropy: new Uint32Array([4, 5, 6]), now: new Date("2026-07-18T00:00:00.000Z"), phase: "FINAL", authenticHumanConfirmation: true });
    const csv = studySessionToCsv(session);
    expect(csv.split("\n")).toHaveLength(3);
    for (const header of DECISION_STUDY_CSV_HEADERS) expect(csv).toContain(`"${header}"`);
    expect(csv.toLowerCase()).not.toMatch(/email|resume|demographic|health|employment_status|home_address|ip_address/);
    expect(csv).toContain(`"${DECISION_STUDY_PROTOCOL_VERSION}"`);
  });

  it("uses browser-local persistence with no network submission path", () => {
    const component = readFileSync(resolve("src/components/study/decision-utility-study.tsx"), "utf8");
    const navigation = readFileSync(resolve("src/components/demo/site-navigation.tsx"), "utf8");
    expect(component).toContain("window.localStorage");
    expect(component).toContain("Export JSON");
    expect(component).toContain("Start Pilot Mode");
    expect(component).not.toMatch(/\bfetch\s*\(/);
    expect(component).not.toMatch(/XMLHttpRequest|sendBeacon|<form|action=/);
    expect(navigation).not.toContain("/study/decision-utility");
  });

  it("keeps the frozen study kit at zero human participants", () => {
    const dryRun = JSON.parse(readFileSync(resolve("build-week/study/dry-run-results.json"), "utf8"));
    const template = readFileSync(resolve("build-week/study/response-template.csv"), "utf8").trim().split(/\r?\n/);
    expect(dryRun.humanParticipantCount).toBe(0);
    expect(dryRun.fabricatedHumanResults).toBe(0);
    expect(template).toHaveLength(1);
  });
});
