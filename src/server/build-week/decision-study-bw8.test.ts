import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { anonymousParticipantId, createDecisionStudySession, DECISION_STUDY_CSV_HEADERS, parseDecisionStudySession, randomizedConditionOrder, studySessionToCsv } from "@/lib/decision-study";

describe("JP-BW8 decision utility study harness", () => {
  it("supports both randomized A/B condition orders", () => {
    expect(randomizedConditionOrder(0.25)).toEqual(["RAW_POSTING", "JOBPILOT"]);
    expect(randomizedConditionOrder(0.75)).toEqual(["JOBPILOT", "RAW_POSTING"]);
    expect(() => randomizedConditionOrder(1)).toThrow();
    expect(() => randomizedConditionOrder(-0.1)).toThrow();
  });

  it("creates and validates an anonymous local-only session", () => {
    const entropy = new Uint32Array([1, 2, 3]);
    const session = createDecisionStudySession({ randomValue: 0.25, participantEntropy: entropy, now: new Date("2026-07-18T00:00:00.000Z") });
    expect(session.participantId).toBe(anonymousParticipantId(entropy));
    expect(session.participantId).toMatch(/^anon-/);
    expect(session.storageMode).toBe("BROWSER_LOCAL_ONLY");
    expect(session.conditionOrder).toEqual(["RAW_POSTING", "JOBPILOT"]);
    expect(parseDecisionStudySession(JSON.stringify(session))).toEqual(session);
    expect(parseDecisionStudySession('{"participantId":"name@example.com"}')).toBeNull();
  });

  it("exports only the frozen no-PII schema", () => {
    const session = createDecisionStudySession({ randomValue: 0.75, participantEntropy: new Uint32Array([4, 5, 6]), now: new Date("2026-07-18T00:00:00.000Z") });
    const csv = studySessionToCsv(session);
    expect(csv.split("\n")).toHaveLength(3);
    for (const header of DECISION_STUDY_CSV_HEADERS) expect(csv).toContain(`"${header}"`);
    expect(csv.toLowerCase()).not.toMatch(/email|resume|demographic|health|employment_status/);
    expect(csv).toContain('"false"');
  });

  it("uses browser-local persistence with no network submission path", () => {
    const component = readFileSync(resolve("src/components/study/decision-utility-study.tsx"), "utf8");
    const navigation = readFileSync(resolve("src/components/demo/site-navigation.tsx"), "utf8");
    expect(component).toContain("window.localStorage");
    expect(component).toContain("Export JSON");
    expect(component).toContain("Export CSV");
    expect(component).toContain("Reset");
    expect(component).not.toMatch(/\bfetch\s*\(/);
    expect(component).not.toMatch(/XMLHttpRequest|sendBeacon|<form|action=/);
    expect(navigation).not.toContain("/study/decision-utility");
  });

  it("keeps the frozen study kit at zero human participants", () => {
    const dryRun = JSON.parse(readFileSync(resolve("build-week/study/dry-run-results.json"), "utf8"));
    const template = readFileSync(resolve("build-week/study/response-template.csv"), "utf8").trim().split(/\r?\n/);
    expect(dryRun.dataClassification).toBe("SYNTHETIC_TOOLING_VALIDATION");
    expect(dryRun.humanParticipantCount).toBe(0);
    expect(dryRun.fabricatedHumanResults).toBe(0);
    expect(template).toHaveLength(1);
  });
});
