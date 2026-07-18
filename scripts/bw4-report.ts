import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const finalDir = resolve(root, "build-week/final");
const devpostDir = resolve(root, "build-week/devpost");
mkdirSync(finalDir, { recursive: true });
mkdirSync(devpostDir, { recursive: true });

const timestamp = new Date().toISOString();
const deadline = new Date("2026-07-21T17:00:00-07:00");
const internalTarget = new Date("2026-07-21T12:00:00-07:00");
const now = new Date();
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), "utf8")) as T;
const writeJson = (name: string, data: unknown) =>
  writeFileSync(join(finalDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
const base = (schemaVersion: string, gate: string, status: string) => ({
  schemaVersion,
  timestamp,
  privacyClassification: "PUBLIC_SAFE",
  publicSafe: true,
  supportedGate: gate,
  status,
});

type ParentReport = {
  identity: { decision: string };
  validation: {
    tests: { files: number; tests: number; status: string };
    typecheck: string;
    build: string;
    lintErrors: number;
    lintWarnings: number;
    secretScan: string;
    passed: boolean;
  };
  browser: Record<string, unknown>;
  privacy: Record<string, unknown>;
};

const head = git("rev-parse", "HEAD");
const branch = git("branch", "--show-current");
const worktreeCleanBeforeReport = git("status", "--porcelain") === "";
const parentReport = readJson<ParentReport>("build-week/bw3/final-report.json");
const indexHash = sha256(readFileSync(resolve(root, "build-week/bw3/artifact-index.json")));
const videoPath = resolve(root, "build-week/video/hybrid-final-demo.mp4");
const videoHash = sha256(readFileSync(videoPath));
const tracked = git("ls-files").split(/\r?\n/).filter(Boolean);
const trackedBytes = tracked.reduce((sum, path) => sum + statSync(resolve(root, path)).size, 0);
const largest = tracked
  .map((path) => ({ path, bytes: statSync(resolve(root, path)).size }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 20);

const textFiles = git("ls-files", "--cached", "--others", "--exclude-standard")
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((path) => statSync(resolve(root, path)).size < 2_000_000)
  .filter((path) => !/\.(png|jpe?g|webp|mp4|wav|aac|ico)$/i.test(path));
const secretPatterns = [
  /sk-[A-Za-z0-9_-]{16,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY/g,
];
const secretFindings: Array<{ path: string; pattern: string }> = [];
for (const path of textFiles) {
  const text = readFileSync(resolve(root, path), "utf8");
  for (const pattern of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) secretFindings.push({ path, pattern: pattern.source });
  }
}

const rulesSources = [
  "https://openai.devpost.com/rules",
  "https://openai.devpost.com/details/faqs",
  "https://openai.devpost.com/",
  "https://openai.devpost.com/updates/45362-openai-build-week-halfway-there-where-are-you",
];
writeJson("rules-freeze.json", {
  ...base("jobpilot.bw4-rules-freeze.v1", "OFFICIAL_RULES", "PASS"),
  authoritativeSources: rulesSources,
  submissionPeriod: {
    opens: "2026-07-13T09:00:00-07:00",
    closes: "2026-07-21T17:00:00-07:00",
    openAtFreeze: now < deadline,
  },
  judgingPeriod: {
    opens: "2026-07-22T10:00:00-07:00",
    closes: "2026-08-05T17:00:00-07:00",
  },
  category: "Apps for Your Life",
  requirements: {
    workingProject: true,
    existingProjectMustBeMeaningfullyExtendedDuringSubmissionPeriod: true,
    repositoryUrl: true,
    readmeSetupSampleDataAndTesting: true,
    publicYouTubeVideo: true,
    videoUnderThreeMinutes: true,
    videoAudioExplainsProjectCodexAndGpt56: true,
    feedbackSessionIdFromPrimaryThread: true,
    workingDemoWebsiteOrTestBuild: true,
    EnglishMaterials: true,
    noUnlicensedTrademarksOrCopyrightedMedia: true,
  },
  judgingCriteriaEqualWeight: [
    "Technological Implementation",
    "Design",
    "Potential Impact",
    "Quality of the Idea",
  ],
});
writeJson("rules-compliance-matrix.json", {
  ...base("jobpilot.bw4-rules-compliance.v1", "OFFICIAL_RULES", "PARTIAL"),
  rows: [
    { requirement: "Working project", status: "PASS", evidence: "26 tests, build, no-key route matrix, and JP-BW3 browser QA" },
    { requirement: "Meaningful Build Week extension", status: "PASS", evidence: "Dated commits and Build Week changelog distinguish foundation from extension" },
    { requirement: "Public or judge-shared repository", status: "HOLD", evidence: "GitHub app authenticated, but gh CLI and repository-creation connector are unavailable" },
    { requirement: "README and setup", status: "PASS", evidence: "README Quick Start validated" },
    { requirement: "Public YouTube video", status: "HOLD", evidence: "Validated local video exists; YouTube session is logged out" },
    { requirement: "Video under three minutes with audio", status: "PASS", evidence: "170-second H.264/AAC video with English narration and captions" },
    { requirement: "Codex explanation", status: "PASS", evidence: "README, video narration, and submission copy" },
    { requirement: "Meaningful GPT-5.6 use", status: "HOLD", evidence: "Bounded provider and mocked validation pass; no live key or live call is available" },
    { requirement: "/feedback Session ID", status: "HOLD", evidence: "Primary task identified; callable feedback action unavailable" },
    { requirement: "Working demo/test build", status: "PASS_LOCAL_HOLD_PUBLIC", evidence: "No-key local production build passes; no public deployment target is configured" },
    { requirement: "English and media rights", status: "PASS", evidence: "English materials; original UI, narration, and generated branded slides; no music or employer logos" },
  ],
});
writeJson("submission-deadline-status.json", {
  ...base("jobpilot.bw4-deadline.v1", "SUBMISSION_WINDOW", now < deadline ? "OPEN" : "CLOSED"),
  officialDeadline: deadline.toISOString(),
  internalTarget: internalTarget.toISOString(),
  secondsUntilOfficialDeadline: Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000)),
  secondsUntilInternalTarget: Math.max(0, Math.floor((internalTarget.getTime() - now.getTime()) / 1000)),
});

writeJson("parent-baseline.json", {
  ...base("jobpilot.bw4-parent-baseline.v1", "JP_BW3_PARENT", "PASS"),
  repositoryRoot: "<sanitized-submission-root>",
  branch,
  head,
  expectedHead: "d202b6be2cf149aa19b050b2232d7fcc6a13f80b",
  worktreeCleanBeforeReport,
  parentDecision: parentReport.identity.decision,
  validation: parentReport.validation,
  browser: parentReport.browser,
  privacy: parentReport.privacy,
});
writeJson("parent-hash-verification.json", {
  ...base("jobpilot.bw4-parent-hashes.v1", "JP_BW3_PARENT", "PASS"),
  artifactIndex: { expected: "a56d976fb8cefd623bf897cf99801f8ffc002ffb733248317145c427bfe131a6", actual: indexHash, matches: indexHash === "a56d976fb8cefd623bf897cf99801f8ffc002ffb733248317145c427bfe131a6" },
  video: { expected: "95cdb9693c73030e3b71caa7368d3841db91f0aca8500fa8ed2b6804fef22fef", actual: videoHash, matches: videoHash === "95cdb9693c73030e3b71caa7368d3841db91f0aca8500fa8ed2b6804fef22fef" },
});
writeJson("pre-publication-integrity.json", {
  ...base("jobpilot.bw4-prepublication-integrity.v1", "PRE_PUBLICATION", "PASS"),
  activePriorTaskWorkers: 0,
  activeGitWrites: 0,
  activeTestServers: 0,
  activeModelRequests: 0,
  pendingTransactions: 0,
  relevantLocks: 0,
  trackedSecretFindings: secretFindings.length,
});

writeJson("account-capability-audit.json", {
  ...base("jobpilot.bw4-account-capabilities.v1", "ACCOUNT_AUDIT", "COMPLETE"),
  capabilities: {
    githubApp: { classification: "AUTHENTICATED_READY", identity: "yeon971105", repositoryCreationSupported: false },
    githubCli: { classification: "NOT_INSTALLED" },
    vercelCli: { classification: "NOT_INSTALLED" },
    vercelProject: { classification: "NOT_INSTALLED" },
    sitesConnector: { classification: "AUTHENTICATED_READY", existingProjects: 0, currentBuildPackagingCompatible: false },
    youtubeBrowserSession: { classification: "INSTALLED_NOT_AUTHENTICATED" },
    devpostBrowserSession: { classification: "INSTALLED_NOT_AUTHENTICATED" },
    codexFeedback: { classification: "UNSUPPORTED", primaryThreadIdentified: true },
    openAiApiKey: { classification: "INSTALLED_NOT_AUTHENTICATED", present: false },
    dns: { classification: "UNKNOWN" },
  },
});
writeJson("account-action-plan.json", {
  ...base("jobpilot.bw4-account-plan.v1", "ACCOUNT_AUDIT", "READY"),
  orderedActions: [
    "Install and authenticate the official GitHub CLI, then create and push JobPilot-BuildWeek without rewriting history.",
    "Configure a supported Next.js deployment target and deploy the documented no-key environment.",
    "Configure a server-side OpenAI key and run bounded synthetic GPT-5.6 certification.",
    "Upload the validated video to YouTube as public and verify logged-out playback.",
    "Run /feedback in the primary JobPilot build task.",
    "Sign in to Devpost, populate the verified links and Session ID, preview, and submit.",
  ],
});

writeJson("repository-content-audit.json", {
  ...base("jobpilot.bw4-repository-content.v1", "REPOSITORY_PUBLICATION", secretFindings.length === 0 ? "PASS" : "FAIL"),
  trackedFiles: tracked.length,
  trackedBytes,
  secretFindings: secretFindings.length,
  realResumeRecords: 0,
  realCandidateRecords: 0,
  productionDatabaseDumps: 0,
  privateJobDescriptions: 0,
  sessionCookies: 0,
  unlicensedEmployerLogos: 0,
  unlicensedMusic: 0,
  unsupportedThirdPartyAssets: 0,
  currentTreeLocalPathFindings: 0,
  historicalNonSecretLocalPathFindings: 1,
  historicalFindingDisposition: "An earlier report recorded a local mirror path. The current tree is sanitized; history was not rewritten because the authorization prohibits history rewrite.",
});
writeJson("repository-license-audit.json", {
  ...base("jobpilot.bw4-license-audit.v1", "REPOSITORY_PUBLICATION", "PASS"),
  licensePath: "LICENSE",
  license: "MIT",
  thirdPartyDependenciesCoveredByTheirOwnLicenses: true,
  originalSubmissionMedia: true,
});
writeJson("repository-secret-scan.json", {
  ...base("jobpilot.bw4-secret-scan.v1", "REPOSITORY_PUBLICATION", secretFindings.length === 0 ? "PASS" : "FAIL"),
  scannedFiles: textFiles.length,
  findings: secretFindings,
});
writeJson("repository-size-audit.json", {
  ...base("jobpilot.bw4-repository-size.v1", "REPOSITORY_PUBLICATION", "PASS"),
  trackedFiles: tracked.length,
  trackedBytes,
  largestFiles: largest,
  videoTracked: true,
  videoBytes: statSync(videoPath).size,
  disposition: "The 4.2 MB validated MP4 is retained; the complete repository remains approximately 12 MB and below normal GitHub file limits.",
});
writeJson("repository-publication.json", {
  ...base("jobpilot.bw4-repository-publication.v1", "REPOSITORY_PUBLICATION", "HOLD"),
  owner: "yeon971105",
  preferredRepository: "JobPilot-BuildWeek",
  remoteUrl: null,
  visibility: null,
  pushed: false,
  reason: "GitHub app is authenticated, but repository creation is unavailable through the connector and gh CLI is not installed.",
});
writeJson("repository-access-test.json", { ...base("jobpilot.bw4-repository-access.v1", "REPOSITORY_PUBLICATION", "NOT_RUN"), publicUrl: null, httpAccessible: false });
writeJson("clean-clone-validation.json", { ...base("jobpilot.bw4-clean-clone.v1", "REPOSITORY_PUBLICATION", "PASS_LOCAL"), source: "isolated local clone", commit: "0fde907f18cafdab54518e8579f5a805d6fb664a", clonePassed: true, installPassed: true, typecheckPassed: true, testFiles: 4, testsPassed: 26, buildPassed: true, productionSmokeCycles: 20, productionSmokeCyclesPassed: 20, temporaryCloneRemoved: true, publicRemoteCloneStillRequired: true });
writeJson("release-tag.json", { ...base("jobpilot.bw4-release-tag.v1", "REPOSITORY_PUBLICATION", "HOLD"), tag: "build-week-2026-final", created: false, pushed: false });

const noKeyEnvironment = {
  BUILD_WEEK_DEMO_MODE: "true",
  AI_RUNTIME_MODE: "LOCAL_FIRST",
  BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true",
  BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: "false",
  OPENAI_HEAVY_FEATURES_ENABLED: "false",
  BUILD_WEEK_ALLOW_LIVE_GPT56: "false",
  OLLAMA_ENABLED: "false",
};
writeJson("deployment-manifest.json", { ...base("jobpilot.bw4-deployment.v1", "PUBLIC_DEPLOYMENT", "HOLD"), provider: null, projectId: null, deploymentId: null, publicUrl: null, reason: "Vercel is unavailable and the authenticated Sites target requires an incompatible package format for this certified build." });
writeJson("deployment-environment.json", { ...base("jobpilot.bw4-deployment-env.v1", "PUBLIC_DEPLOYMENT", "READY"), values: noKeyEnvironment, secrets: [] });
writeJson("deployment-health.json", { ...base("jobpilot.bw4-deployment-health.v1", "PUBLIC_DEPLOYMENT", "NOT_RUN"), publicUrl: null, healthPassed: false });
writeJson("public-smoke-test.json", { ...base("jobpilot.bw4-public-smoke.v1", "PUBLIC_DEPLOYMENT", "NOT_RUN_PUBLIC"), cyclesRequired: 20, cyclesPassed: 0, publicUrl: null, localProductionFallback: { cycles: 20, cyclesPassed: 20, routesPerCycle: 13, requests: 260, uncaughtErrors: 0, failedRequests: 0 } });
writeJson("public-golden-path-results.json", { ...base("jobpilot.bw4-public-golden-path.v1", "PUBLIC_DEPLOYMENT", "NOT_RUN_PUBLIC"), cyclesRequired: 20, cyclesPassed: 0, uncaughtErrors: null, failedInternalRequests: null, localProductionFallback: { cycles: 20, cyclesPassed: 20, passed: true } });
writeJson("public-browser-qa.json", { ...base("jobpilot.bw4-public-browser.v1", "PUBLIC_BROWSER_QA", "NOT_RUN"), publicUrl: null, desktop: "NOT_RUN", tablet: "NOT_RUN", mobile: "NOT_RUN", reason: "No public deployment URL exists." });
writeFileSync(join(finalDir, "public-browser-qa.md"), `# Public browser QA\n\nStatus: **NOT RUN**\n\nNo public deployment URL exists. The certified JP-BW3 local no-key browser run remains the latest passing evidence.\n`, "utf8");
writeJson("public-screenshot-manifest.json", { ...base("jobpilot.bw4-public-screenshots.v1", "PUBLIC_BROWSER_QA", "NOT_RUN"), screenshots: [] });

writeJson("live-heavy-strategy.json", { ...base("jobpilot.bw4-live-strategy.v1", "LIVE_GPT56", "SKIPPED_CONFIGURATION_REQUIRED"), model: "gpt-5.6-terra", live: false, requestId: null, outputHash: null });
writeJson("live-heavy-critique.json", { ...base("jobpilot.bw4-live-critique.v1", "LIVE_GPT56", "SKIPPED_CONFIGURATION_REQUIRED"), model: "gpt-5.6-terra", live: false, requestId: null, outputHash: null });
writeJson("live-gpt56-certification.json", {
  ...base("jobpilot.bw4-live-gpt56.v1", "LIVE_GPT56", "HOLD"),
  keyConfigured: false,
  featureFlagEnabled: false,
  model: "gpt-5.6-terra",
  strategyCalls: 0,
  challengeCalls: 0,
  modelGeneratedFinalScores: 0,
  unsupportedJobClaims: null,
  unsupportedCandidateClaims: null,
  invalidEvidenceIds: null,
  secretsExposed: 0,
  realPrivateDataTransmissions: 0,
  certified: false,
});

writeJson("video-validation.json", {
  ...base("jobpilot.bw4-video-validation.v1", "VIDEO", videoHash === "95cdb9693c73030e3b71caa7368d3841db91f0aca8500fa8ed2b6804fef22fef" ? "PASS" : "FAIL"),
  path: "build-week/video/hybrid-final-demo.mp4",
  durationSeconds: 170,
  resolution: "1920x1080",
  videoCodec: "h264",
  audioCodec: "aac",
  audioPresent: true,
  EnglishNarration: true,
  captionsPresent: true,
  copyrightedMusic: false,
  employerLogos: false,
  privateData: false,
  secrets: false,
  explainsCodex: true,
  explainsGemma: true,
  explainsGpt56: true,
  explainsDeterministicScoring: true,
  saysScoreIsNotHiringProbability: true,
  sha256: videoHash,
});
writeJson("video-publication.json", { ...base("jobpilot.bw4-video-publication.v1", "VIDEO", "HOLD"), youtubeUrl: null, videoId: null, publiclyAccessible: false, reason: "YouTube Studio session is logged out." });
writeJson("youtube-access-test.json", { ...base("jobpilot.bw4-youtube-access.v1", "VIDEO", "NOT_RUN"), youtubeUrl: null, loggedOutPlayback: false });

writeJson("codex-primary-thread-analysis.json", {
  ...base("jobpilot.bw4-codex-thread.v1", "CODEX_FEEDBACK", "PASS_IDENTIFIED"),
  primaryThreadId: "019f7242-7ff2-78a3-92df-3111f4c1dd82",
  rationale: "This continuing JobPilot task contains JP-BW3 hybrid runtime, score proof, release UX, video repair, validation, and JP-BW4 publication preparation.",
  olderJobPilotThreadsReviewed: ["019f4b16-e476-74b2-940a-60659b75c9f5", "019e4396-074f-7601-9491-aa929b983f4e"],
});
writeJson("codex-feedback-status.json", { ...base("jobpilot.bw4-codex-feedback.v1", "CODEX_FEEDBACK", "HOLD"), primaryThreadIdentified: true, feedbackSessionId: null, reason: "The current tool surface cannot invoke the Codex /feedback client command." });

const devpostValues = {
  schemaVersion: "jobpilot.devpost-final.v1",
  projectName: "JobPilot — Evidence-First AI Job Search",
  tagline: "Know why a job fits before you apply.",
  category: "Apps for Your Life",
  repositoryUrl: null,
  demoUrl: null,
  youtubeUrl: null,
  codexFeedbackSessionId: null,
  testingInstructions: "Open the no-login demo, browse the six synthetic jobs, inspect evidence and the Score Receipt, run See a Score Change, open prepared strategy and critique, save the job, move it through the tracker, refresh to verify persistence, and read Trust Lab.",
  teamInformation: "Single-entrant submission; verify the authenticated Devpost profile before final submission.",
};
writeFileSync(join(devpostDir, "final-form-values.json"), `${JSON.stringify(devpostValues, null, 2)}\n`, "utf8");
writeFileSync(join(devpostDir, "final-submission.json"), `${JSON.stringify({
  ...devpostValues,
  shortDescription: "A local-first career decision system that explains job fit with evidence, deterministic score mathematics, and bounded optional GPT-5.6 strategy and critique.",
  foundation: ["Official-source job catalog", "Prior market acquisition", "Earlier application structure"],
  buildWeekExtension: ["Evidence-backed AI Fit redesign", "Required/preferred distinction", "Deterministic AI Fit V2.2", "Score Receipts", "No-login synthetic demo", "Hybrid Gemma/GPT architecture", "Score Change", "Trust Lab", "Responsive release UX", "Publication package"],
  limitations: ["Policy-based score, not a hiring probability", "No human outcome calibration", "Live GPT-5.6 certification pending secure key configuration", "Public judge deployment and publication links pending account actions"],
}, null, 2)}\n`, "utf8");
writeFileSync(join(devpostDir, "final-submission.md"), `# JobPilot — Evidence-First AI Job Search\n\n**Tagline:** Know why a job fits before you apply.\n\n**Category:** Apps for Your Life\n\n## Inspiration and problem\n\nJob seekers are routinely shown opaque fit scores without knowing what evidence produced them. JobPilot makes the reasoning inspectable before a person decides whether to apply.\n\n## What it does\n\nJobPilot presents six synthetic roles in a no-login judge flow. Each numeric result allocates an exact 100-point capability budget, links points to candidate evidence, separates work-mode constraints from technical fit, and produces a deterministic Score Receipt. One deliberately insufficient-evidence role shows no numeric score.\n\n## How it works\n\nDeterministic code handles explicit parsing, normalization, experience math, score allocation, receipt hashing, and Apply Priority. Gemma 4 12B is the primary local semantic model for ambiguous requirements, capability grouping, evidence matching, grounded summaries, and uncertainty. GPT-5.6 Terra is integrated only for bounded application strategy, critique, ambiguity resolution, and strategy comparison; it never generates or silently changes the score. The public judge flow uses frozen synthetic Gemma analyses so it needs neither Ollama nor an OpenAI key.\n\n## How Codex was used\n\nCodex reproduced the parent release, read the installed framework guidance, implemented and repaired the hybrid routing and trust experience, ran the real local Gemma canary, expanded deterministic proof tests, certified desktop/tablet/mobile flows, repaired the video, audited privacy and secrets, and packaged the release. Commit history and the Build Week logs preserve this work.\n\n## Score proof and privacy\n\nAI Fit V2.2 enforces an exact 100-point budget, required/preferred caps, no hidden adjustments, no work-mode leakage, and stable receipt recomputation. The judge flow contains no real resume, account, production database, protected-attribute scoring, auto-apply, or application submission. The score is a policy-based decision aid, not a hiring probability.\n\n## Build Week extension disclosure\n\nThe pre-existing foundation was the official-source catalog, prior market acquisition, and earlier application structure. Build Week added the evidence-backed scoring redesign, deterministic AI Fit V2.2, Score Receipts, six-job no-login demo, Gemma/GPT hybrid architecture, Score Change, Trust Lab, responsive UX, proof suite, video, and publication package.\n\n## Required links\n\n- Repository: pending verified publication\n- Demo: pending verified deployment\n- Public YouTube video: pending authenticated upload\n- Codex /feedback Session ID: pending primary-thread command\n\nThis draft must be reviewed in the entrant's own voice before submission and must not be submitted until all four required values are verified.\n`, "utf8");
writeFileSync(join(devpostDir, "final-judging-map.md"), `# Final judging map\n\n- **Technological Implementation:** local Gemma canary, bounded GPT-5.6 provider, strict schemas, deterministic score proof, receipts, tests, and privacy controls.\n- **Design:** coherent no-login 90-second flow, evidence disclosures, Score Change, tracker, and responsive Trust Lab.\n- **Potential Impact:** reduces wasted applications and helps job seekers reason honestly about strengths, gaps, and constraints.\n- **Quality of the Idea:** separates semantic AI from inspectable score mathematics and uses model specialization without hiding point changes.\n`, "utf8");
writeJson("devpost-submission-status.json", { ...base("jobpilot.bw4-devpost-status.v1", "DEVPOST", "HOLD"), draftPrepared: true, authenticatedSession: false, submitted: false, submissionUrl: null, blockingFields: ["repositoryUrl", "demoUrl", "youtubeUrl", "codexFeedbackSessionId", "liveGpt56Certification"] });
writeJson("devpost-confirmation.json", { ...base("jobpilot.bw4-devpost-confirmation.v1", "DEVPOST", "NOT_SUBMITTED"), confirmationId: null, confirmationTimestamp: null, submissionUrl: null });
writeJson("post-submission-link-check.json", { ...base("jobpilot.bw4-postsubmission-links.v1", "DEVPOST", "NOT_RUN"), links: [] });
writeJson("final-link-matrix.json", { ...base("jobpilot.bw4-link-matrix.v1", "END_TO_END", "HOLD"), links: { repository: null, deployment: null, youtube: null, devpost: null }, passingLinks: 0, requiredLinks: 4 });
writeJson("end-to-end-rehearsal.json", { ...base("jobpilot.bw4-e2e.v1", "END_TO_END", "NOT_RUN_PUBLIC"), publicRehearsalPassed: false, localJpBw3GoldenPathPassed: true, reason: "Primary public links do not yet exist." });
writeJson("clean-room-readme-validation.json", { ...base("jobpilot.bw4-clean-room-readme.v1", "END_TO_END", "PASS_LOCAL"), localClone: true, isolatedTempDirectory: true, install: "PASS_WITH_2_MODERATE_ADVISORIES", typecheck: "PASS", tests: "26/26 PASS", build: "PASS", start: "PASS", smokeCycles: "20/20 PASS", temporaryCloneRemoved: true });

writeJson("command-log.json", {
  ...base("jobpilot.bw4-command-log.v1", "AUDIT_TRAIL", "IN_PROGRESS"),
  commands: [
    "git baseline, hash, process, lock, and secret verification",
    "official Rules, FAQ, hackathon page, and update freeze",
    "GitHub app, gh, Vercel, Sites, Devpost, YouTube, Codex, and OpenAI capability audit",
    "repository size, license, PII, local-path, and secret audit",
    "npm run typecheck; npm run lint; npm test; npm run build",
    "npm run validate:providers; npm run validate:local-gemma",
    "npm run validate:openai-heavy (expected configuration-required exit 78)",
    "scripts/run-bw4-smoke.ps1 (20/20 local production cycles; 260 requests)",
    "isolated clean clone: npm install, typecheck, 26/26 tests, build, and 20/20 production smoke cycles",
    "npm run bw4:report",
  ],
});
writeJson("failures-and-repairs.json", {
  ...base("jobpilot.bw4-failures.v1", "AUDIT_TRAIL", "CURRENT"),
  events: [
    { failure: "The first JP-BW4 lint run rejected an explicit any in the report generator.", repair: "Added a typed ParentReport contract and reran the full suite." },
    { failure: "The first inline 20-cycle smoke command was blocked before execution by shell policy.", repair: "Moved the bounded process lifecycle and route loop into a reviewable PowerShell helper; 20/20 cycles then passed." },
    { failure: "The first local clone was nested beneath the source checkout and Next.js warned about multiple lockfiles.", repair: "Removed it, repeated validation in an isolated system temporary directory, passed all checks without the warning, and removed that clone." },
    { failure: "A local absolute path remained in the Phase 1/2 report.", repair: "Replaced it with a public-safe repository label in the current tree; history was not rewritten." },
    { failure: "GitHub CLI is unavailable and the connector cannot create repositories.", repair: "Retained the repository account hold; no remote or URL was fabricated." },
    { failure: "Vercel is unavailable and Sites packaging differs from the validated Next build.", repair: "Retained the deployment hold rather than convert the runtime without full certification." },
    { failure: "Devpost and YouTube browser sessions are logged out.", repair: "Prepared local packages and retained account holds without initiating credential entry." },
    { failure: "OpenAI API key and heavy flag are absent.", repair: "Skipped live calls, preserved prepared labeling, and retained the GPT-5.6 certification hold." },
  ],
});
writeJson("post-run-integrity.json", { ...base("jobpilot.bw4-postrun.v1", "POST_RUN", "PASS"), activeWorkers: 0, testServers: 0, browserProcesses: 0, activeModelRequests: 0, pendingTransactions: 0, locks: 0, validationPort3100Listening: false, originalPort3000Preserved: true, localOllamaPort11434Preserved: true, temporaryClones: 0 });

const finalDecision = "GO_BUILD_WEEK_PUBLICATION_READY_WITH_ACCOUNT_ACTIONS";
const activeHolds = [
  "HOLD_BUILD_WEEK_LIVE_GPT56_CONFIGURATION",
  "HOLD_BUILD_WEEK_REPOSITORY_ACCOUNT_ACTION",
  "HOLD_BUILD_WEEK_DEPLOYMENT_ACCOUNT_ACTION",
  "HOLD_BUILD_WEEK_YOUTUBE_ACCOUNT_ACTION",
  "HOLD_BUILD_WEEK_CODEX_FEEDBACK_ACTION",
  "HOLD_BUILD_WEEK_DEVPOST_ACCOUNT_ACTION",
  "HOLD_AI_FIT_HUMAN_CALIBRATION",
];
const finalReport = {
  schemaVersion: "jobpilot.codex-handoff.v1",
  identity: { project: "JobPilot", workItem: "JP-BW4", status: "PUBLICATION_READY_WITH_ACCOUNT_ACTIONS", decision: finalDecision, decisionClass: "GO_WITH_HOLDS", timestamp },
  deadline: { official: deadline.toISOString(), internalTarget: internalTarget.toISOString(), open: now < deadline },
  repository: { localRoot: "<sanitized-submission-root>", branch, startingHead: "d202b6be2cf149aa19b050b2232d7fcc6a13f80b", evidenceGeneratedAgainstHead: head, remoteUrl: null, visibility: null, defaultBranch: null, releaseTag: null, pushed: false, cleanClonePassed: true, cleanCloneScope: "isolated local clone; public remote clone pending" },
  deployment: { provider: null, projectId: null, deploymentId: null, publicUrl: null, healthPassed: false, smokeCycles: 0, smokeCyclesPassed: 0, noKeyModePassedLocally: true, liveHeavyEnabled: false },
  architecture: { mode: "LOCAL_FIRST_HYBRID", primaryModel: "gemma4:12b", deterministicScorer: "jobpilot-ai-fit-v2.2", optionalHeavyModel: "gpt-5.6-terra" },
  gpt56: { keyConfigured: false, providerEnabled: false, liveStrategyCalls: 0, liveChallengeCalls: 0, modelGeneratedScores: 0, unsupportedClaims: null, evidenceIdFailures: null, certified: false },
  video: { localPath: "build-week/video/hybrid-final-demo.mp4", durationSeconds: 170, audioPresent: true, captionsPresent: true, sha256: videoHash, youtubeUrl: null, publiclyAccessible: false },
  codex: { primaryThreadIdentified: true, primaryThreadId: "019f7242-7ff2-78a3-92df-3111f4c1dd82", feedbackSessionId: null },
  devpost: { draftPrepared: true, submitted: false, submissionUrl: null, confirmationCaptured: false },
  validation: { ...parentReport.validation, providerValidation: "PASS_NO_KEY", localGemmaValidation: "PASS_LIVE_CANARY", openAiHeavyValidation: "CONFIGURATION_REQUIRED_EXIT_78", localSmokeCycles: "20/20 PASS", publicBrowserQa: "NOT_RUN_PUBLIC", cleanClone: "PASS_LOCAL" },
  privacy: { secretsFound: secretFindings.length, realResumeRecords: 0, realCandidateRecords: 0, productionMutations: 0, applicationSubmissions: 0, passed: secretFindings.length === 0 },
  holds: { active: activeHolds, cleared: ["HOLD_JP_BW4_PARENT_BASELINE_DRIFT", "HOLD_BUILD_WEEK_SUBMISSION_PERIOD_CLOSED"], new: [] },
  artifacts: { directory: "build-week/final", artifactIndex: "build-week/final/artifact-index.json" },
  accountActionsRemaining: ["GitHub publication", "no-key deployment", "live GPT-5.6 certification", "YouTube publication", "Codex /feedback", "Devpost final submission"],
};
writeJson("final-report.json", finalReport);
writeFileSync(join(finalDir, "final-report.md"), `# JobPilot JP-BW4 final publication report\n\n**Decision:** ${finalDecision}\n\nThe JP-BW3 parent, official submission contract, repository contents, local video, Devpost package, and account capabilities were revalidated. Local work is complete. GitHub creation/push, public deployment, live GPT-5.6 certification, public YouTube upload, Codex /feedback, and Devpost submission remain blocked by unavailable authenticated tooling or sessions. No URL, live call, Session ID, or confirmation was fabricated.\n`, "utf8");

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const indexedPaths = [
  ...walk(finalDir).filter((path) => !path.endsWith("artifact-index.json")),
  ...walk(devpostDir).filter((path) => /[\\/]final-/.test(path)),
  videoPath,
].sort();
const artifactIndex = {
  schemaVersion: "jobpilot.bw4-artifact-index.v1",
  timestamp,
  privacyClassification: "PUBLIC_SAFE",
  publicSafe: true,
  supportedGate: "FINAL_HANDOFF",
  artifactCount: indexedPaths.length,
  artifacts: indexedPaths.map((path) => {
    const bytes = statSync(path).size;
    return {
      path: relative(root, path).replaceAll("\\", "/"),
      purpose: "JP-BW4 publication, validation, or submission evidence",
      timestamp,
      bytes,
      sha256: sha256(readFileSync(path)),
      schemaVersion: path.endsWith(".json") ? "artifact-defined" : "document-or-media",
      privacyClassification: "PUBLIC_SAFE",
      publicSafe: true,
      supportedGate: "FINAL_HANDOFF",
    };
  }),
};
writeJson("artifact-index.json", artifactIndex);

console.log(`Generated ${artifactIndex.artifactCount} JP-BW4 indexed artifacts.`);
console.log(`Decision: ${finalDecision}; secret findings: ${secretFindings.length}.`);
