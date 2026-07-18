import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { defaultSummaryGroups, dimensionMap, evidencePresentation, fitPresentation } from "@/lib/decision-presentation";
import { scoreJob } from "@/server/build-week/scorer";

const read = (path: string) => readFileSync(path, "utf8");

describe("JP-BW11R final product decision presentation", () => {
  it("keeps presentation labels independent from score mathematics", () => {
    expect(fitPresentation(75).label).toBe("STRONG FIT");
    expect(fitPresentation(74).label).toBe("WORTH REVIEWING");
    expect(fitPresentation(55).label).toBe("WORTH REVIEWING");
    expect(fitPresentation(54).label).toBe("LIMITED FIT");
    expect(fitPresentation(null).label).toBe("INSUFFICIENT EVIDENCE");
    expect(evidencePresentation(90)).toBe("VERY STRONG EVIDENCE");
    expect(evidencePresentation(75)).toBe("GOOD EVIDENCE");
    expect(evidencePresentation(60)).toBe("MIXED EVIDENCE");
    expect(evidencePresentation(59)).toBe("LIMITED EVIDENCE");
  });

  it("creates mutually exclusive three-item summary groups", () => {
    for (const job of DEMO_JOBS) {
      const groups = defaultSummaryGroups(scoreJob(job));
      expect(groups.strong.length).toBeLessThanOrEqual(3);
      expect(groups.attention.length).toBeLessThanOrEqual(3);
      const ids = [...groups.strong, ...groups.attention].map((item) => item.capabilityGroupId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(groups.strong.every((item) => ["MATCHED", "STRONG_EQUIVALENT"].includes(item.matchClass))).toBe(true);
      expect(groups.attention.every((item) => !["MATCHED", "STRONG_EQUIVALENT"].includes(item.matchClass))).toBe(true);
    }
  });

  it("derives the five visual dimensions from existing midpoint and maximum values", () => {
    const analysis = scoreJob(DEMO_JOBS[0]!);
    const dimensions = dimensionMap(analysis);
    expect(dimensions.map((item) => item.label)).toEqual(["Technical Skills", "Relevant Experience", "Role and Domain", "Customer and Stakeholder", "Education and Certifications"]);
    expect(dimensions).toHaveLength(5);
    expect(dimensions.every((item) => item.percent === null || (Number.isInteger(item.percent) && item.percent >= 0 && item.percent <= 100))).toBe(true);
    expect(scoreJob(DEMO_JOBS[0]!).displayedScore).toBe(analysis.displayedScore);
  });

  it("exposes shortlist rationale before the role cards without technical clutter", () => {
    const source = read("src/components/demo/shortlist.tsx");
    for (const text of ["Why these three?", "Best evidence fit", "Works with your preferences", "Recent enough to act on", "No hidden shortlist score.", "See the full ranking method"]) expect(source).toContain(text);
    expect(source.indexOf("Why these three?")).toBeLessThan(source.indexOf("Today's shortlisted roles"));
    expect(source).not.toContain("toFixed(1)");
    expect(source).not.toContain("stable ID explanation");
  });

  it("keeps visual decisions before the collapsed technical ledger", () => {
    const source = read("src/components/demo/job-detail.tsx");
    for (const text of ["Your Fit at a Glance", "Relevant experience", "Practical fit", "Strong Evidence", "Attention Areas", "A. 100-POINT ALLOCATION", "B. SCORE CONTRIBUTION", "C. EVIDENCE QUALITY", "D. RECEIPT", "E. Technical Ledger"]) expect(source).toContain(text);
    expect(source).toContain("<details className=\"paper-card\"><summary className=\"min-h-11 font-serif text-3xl\">E. Technical Ledger</summary>");
    expect(source).toContain("defaultSummaryGroups(currentAnalysis)");
    expect(source).toContain("Practical constraints affect Apply Priority, not technical Fit Score.");
  });
});
