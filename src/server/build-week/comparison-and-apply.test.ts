import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allFrozenDestinationRecords, destinationActionFor } from "@/lib/destination-trust";

const read = (path: string) => readFileSync(path, "utf8");

describe("comparison and direct-employer safety contract", () => {
  it("enforces a persistent three-role comparison limit", () => {
    const store = read("src/components/demo/demo-store.ts");
    expect(store).toContain("current.comparisonIds.length >= 3 ? current");
    expect(store).toContain("comparisonIds: value.comparisonIds ?? []");
    const list = read("src/components/demo/job-list.tsx");
    expect(list).toContain("comparisonFull={tracker.comparisonIds.length >= 3}");
    expect(list).toContain("three-role limit reached");
  });

  it("compares only visible factors and creates no aggregate score", () => {
    const comparison = read("src/components/demo/comparison.tsx");
    for (const factor of ["Fit Score", "Evidence Quality", "Apply Priority", "Blocker", "Posted", "Work mode", "Required experience", "Preferred experience", "Top matches", "Biggest gaps"]) expect(comparison).toContain(factor);
    expect(comparison).toContain("No hidden comparison formula");
    expect(comparison).toContain("The comparison creates no new score");
    expect(comparison).toContain("selected.map");
    expect(comparison).toContain(".slice(0, 3)");
  });

  it("opens a safe synthetic employer destination in a new tab", () => {
    for (const path of ["src/components/demo/job-list.tsx", "src/components/demo/job-detail.tsx", "src/components/demo/comparison.tsx"]) {
      const source = read(path);
      expect(source).toContain("<DestinationAction");
    }
    const action = read("src/components/demo/destination-action.tsx");
    expect(action).toContain("target=\"_blank\"");
    expect(action).toContain("rel=\"noopener noreferrer\"");
    expect(read("src/lib/destination-trust.ts")).toContain("/demo/employer-posting/");
  });

  it("reserves the Apply CTA for verified destinations", () => {
    const records = allFrozenDestinationRecords();
    expect(new Set(records.map((record) => record.state))).toEqual(new Set(["ORIGINAL_POSTING_RECORDED", "URL_REACHABLE", "APPLY_DESTINATION_VERIFIED", "VALIDATION_PENDING", "UNAVAILABLE"]));
    for (const record of records) {
      const action = destinationActionFor(record.jobId);
      if (record.state === "APPLY_DESTINATION_VERIFIED") expect(action.label).toBe("Apply on Employer Site ↗");
      else expect(action.label).not.toContain("Apply on Employer Site");
      if (record.state === "VALIDATION_PENDING" || record.state === "UNAVAILABLE") expect(action.href).toBeNull();
    }
  });

  it("never provides a form, submission, or automatic Applied transition", () => {
    const employer = read("src/components/demo/employer-posting.tsx");
    expect(employer).toContain("Fictional employer demo");
    expect(employer).toContain("Application submission is intentionally disabled in the Build Week demo.");
    expect(employer).toContain("disabled className");
    expect(employer).toContain("never marks this role Applied");
    expect(employer).toContain('setStage(job.id, "PREPARING")');
    expect(employer).toContain('setStage(job.id, "SAVED")');
    expect(employer).not.toContain("<form");
    expect(employer).not.toContain('setStage(job.id, "APPLIED")');
    expect(employer).not.toMatch(/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  });
});
