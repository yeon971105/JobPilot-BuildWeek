import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as privateResumePost } from "@/app/api/private/resume/route";

const read = (path: string) => readFileSync(path, "utf8");

afterEach(() => vi.unstubAllEnvs());

describe("JP-BW7 product UX contract", () => {
  it("keeps the landing decision user-centered and exact", () => {
    const source = read("src/components/demo/landing.tsx");
    for (const copy of [
      "NEARBY JOBS, PRIORITIZED FOR YOU",
      "Find the roles worth your time.",
      "Stop searching job by job. Discover, compare, and apply from one clear decision view.",
      "See My Best Matches",
      "Try the Demo",
      "Use My Resume Privately",
      "Official-source discovery",
      "Private resume analysis",
      "Transparent Fit Score",
      "No auto-apply",
    ]) expect(source).toContain(copy);
  });

  it("provides the required navigation and profile controls", () => {
    const navigation = read("src/components/demo/site-navigation.tsx");
    for (const label of ["Jobs", "Tracker", "Trust Lab", "Build Week", "Profile"]) expect(navigation).toContain(`label: "${label}"`);
    const menu = read("src/components/profile/profile-menu.tsx");
    for (const label of ["Demo Candidate A", "View Demo Profile", "Use My Resume Privately", "Work Preferences", "Reset Demo Session"]) expect(menu).toContain(label);
  });

  it("progressively discloses evidence, strategy, and the technical receipt", () => {
    const detail = read("src/components/demo/job-detail.tsx");
    expect(detail).toContain('const tabs: TabName[] = ["Overview", "Evidence", "Experience", "Score Proof"]');
    expect(detail.match(/\.slice\(0, 3\)/g)).toHaveLength(2);
    expect(detail).toContain("receiptOpen && <FocusModal");
    expect(detail).toContain("strategyOpen && <FocusModal");
    expect(detail).toContain('role="dialog" aria-modal="true"');
    expect(detail).toContain('if (event.key === "Escape") onClose()');
    expect(detail).toContain('if (event.key !== "Tab"');
    expect(detail).toContain("privateActive && cachedPrivate ? cachedPrivate.analysis : analysis");
    expect(detail).toContain("privateActive && cachedPrivate ? cachedPrivate.provider");
    expect(detail).not.toContain("DetailSection");
  });

  it("keeps practical preferences separate from technical fit", () => {
    const preferences = read("src/components/profile/preferences.tsx");
    for (const label of ["Accepted work modes", "Preferred locations", "Remote eligibility", "Maximum travel percentage", "Open to relocation", "Optional authorization note"]) expect(preferences).toContain(label);
    expect(preferences).toContain("practical priority—not technical Fit Score");
    expect(preferences).toContain("never requests device location or calls a geocoding service");
  });

  it("exposes full profile review and explicit local clearing", () => {
    const onboarding = read("src/components/profile/resume-onboarding.tsx");
    for (const label of ["Role history", "Projects", "Skills", "Education and certifications", "Candidate evidence excerpts", "Profile warnings", "Confirm Private Profile"]) expect(onboarding).toContain(label);
    const store = read("src/components/profile/profile-store.ts");
    expect(store).toContain('mode: "DEMO", profile: null');
    expect(store).toContain("analyses: {}");
  });

  it("rejects resume bodies before parsing in Public Judge Mode", async () => {
    vi.stubEnv("LOCAL_PRIVATE_MODE", "false");
    const response = await privateResumePost(new Request("http://local/api/private/resume", { method: "POST", body: "synthetic private body" }));
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "LOCAL_PRIVATE_MODE_DISABLED" });
  });

  it("contains no raw-resume logging calls or cloud endpoints in private processing code", () => {
    const privateSources = [
      "src/server/private-profile/resume-parser.ts",
      "src/server/private-profile/local-analysis.ts",
      "src/app/api/private/resume/route.ts",
      "src/app/api/private/analyze/route.ts",
    ].map(read).join("\n");
    expect(privateSources).not.toMatch(/console\.(log|info|warn|error)/);
    expect(privateSources).not.toMatch(/api\.openai\.com|anthropic\.com|googleapis\.com/);
  });
});
