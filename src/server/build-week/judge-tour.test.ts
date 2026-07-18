import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("90-second judge tour contract", () => {
  it("contains the exact seven-stage decision journey and explicit completion proof", () => {
    const source = readFileSync("src/components/demo/judge-tour.tsx", "utf8");
    for (const label of ["DISCOVER", "PRIORITIZE", "UNDERSTAND", "INSPECT", "VERIFY", "APPLY", "TRACK"]) expect(source).toContain(`label: "${label}"`);
    for (const proof of ["Nearby discovery", "Resume-aware prioritization", "Required vs. preferred", "Relevant experience", "Exact score mathematics", "Direct employer destination", "No auto-apply"]) expect(source).toContain(proof);
    expect(source).toContain("Start the 90-Second Tour");
    expect(source).toContain("Skip tour");
    expect(source).toContain("Restart Tour");
    expect(source).toContain('event.key === "Escape"');
    expect(source).toContain('event.key === "ArrowRight"');
    expect(source).toContain('aria-live="polite"');
  });

  it("matches the public judge-tour contract artifact", () => {
    const contract = JSON.parse(readFileSync("build-week/bw7/judge-tour-contract.json", "utf8")) as { totalSteps: number; optional: boolean; skippable: boolean; restartable: boolean; mobileSafe: boolean; screenReaderAnnouncements: boolean; steps: string[] };
    expect(contract).toMatchObject({ totalSteps: 7, optional: true, skippable: true, restartable: true, mobileSafe: true, screenReaderAnnouncements: true });
    expect(contract.steps).toEqual(["DISCOVER", "PRIORITIZE", "UNDERSTAND", "INSPECT", "VERIFY", "APPLY", "TRACK"]);
  });
});
