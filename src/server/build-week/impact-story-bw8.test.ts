import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("JP-BW8 impact and differentiation story", () => {
  it("centers the product on the five-stage decision loop", () => {
    for (const file of ["src/components/demo/landing.tsx", "src/components/demo/trust-lab.tsx", "README.md", "build-week/devpost/application-fatigue-final-submission.md"]) {
      const source = readFileSync(resolve(file), "utf8");
      for (const stage of ["DISCOVER", "PRIORITIZE", "UNDERSTAND", "APPLY", "TRACK"]) expect(source).toContain(stage);
    }
  });

  it("publishes exactly five complete Codex repair moments", () => {
    const source = readFileSync(resolve("src/app/about/build-week/page.tsx"), "utf8");
    for (const title of ["Incorrect work-mode interpretation", "Scoring-budget defect", "Receipt and verifier construction", "Missing Tailwind production pipeline", "Dense Job Detail transformation"]) expect(source).toContain(title);
    for (const step of ["Observed", "Reproduced", "Repaired", "Regression tested"]) expect(source).toContain(`label=\"${step}\"`);
    expect((source.match(/title: \"/g) ?? [])).toHaveLength(5);
  });

  it("uses neutral bounded comparison language", () => {
    const combined = ["src/components/demo/landing.tsx", "src/components/demo/trust-lab.tsx", "README.md", "build-week/devpost/application-fatigue-final-submission.md"].map((file) => readFileSync(resolve(file), "utf8")).join("\n");
    expect(combined).toContain("Traditional fragmented search");
    expect(combined).toContain("processed");
    expect(combined.toLowerCase()).not.toMatch(/linkedin|indeed|glassdoor|covers every role|complete-market coverage is achieved|all jobs in/);
  });
});
