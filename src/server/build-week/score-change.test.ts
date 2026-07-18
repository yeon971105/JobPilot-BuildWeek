import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildScoreChangeScenario } from "@/server/build-week/score-change";

describe("score sensitivity and anti-hardcoding", () => {
  it("recomputes only the affected capability and produces a new receipt", () => {
    const scenario = buildScoreChangeScenario();
    expect(scenario.originalScore).not.toBe(scenario.newScore);
    expect(scenario.changedPoints).toBeGreaterThan(0);
    expect(scenario.unchangedUnrelatedPoints).toBe(true);
    expect(scenario.originalReceiptHash).not.toBe(scenario.newReceiptHash);
    expect(scenario.disclaimer).toContain("does not recommend adding experience");
  });

  it("contains no fixed final-score or receipt-hash literals in product source", () => {
    const productSource = ["src/components/demo/job-detail.tsx", "src/components/demo/job-list.tsx", "src/server/build-week/scorer.ts"].map((path) => readFileSync(path, "utf8")).join("\n");
    expect(productSource).not.toMatch(/displayedScore\s*[:=]\s*(?:52|70|92|97|99)\b/);
    expect(productSource).not.toMatch(/[a-f0-9]{64}/i);
  });
});
