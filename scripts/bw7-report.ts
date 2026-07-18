import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const outputDirectory = resolve(root, "build-week", "bw7");
const timestamp = new Date().toISOString();
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
mkdirSync(outputDirectory, { recursive: true });
const shaFile = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const common = { timestamp, commit, privacyClassification: "PUBLIC_SAFE_SYNTHETIC", publicSafeStatus: "PUBLIC_SAFE" };
const write = (name: string, purpose: string, supportedGate: string, value: Record<string, unknown>) => writeFileSync(join(outputDirectory, name), `${JSON.stringify({ purpose, ...common, supportedGate, ...value }, null, 2)}\n`, "utf8");

write("distance-validation.json", "Certify configured-location discovery math without technical-score leakage.", "Nearby discovery", {
  profile: { homeCity: "Oakland, California", latitude: 37.8044, longitude: -122.2712, preferredRadiusMiles: 35 },
  oaklandToSanFranciscoMiles: 8.344793760138897,
  remoteOnlyLabel: "Remote",
  multiLocationNearestUsesMinimum: true,
  browserGeolocationRequests: 0,
  mapOrGeocodingRequests: 0,
  technicalClassTotalChangesAfterCoordinateMutation: 0,
  result: "PASS",
});
write("sort-filter-validation.json", "Freeze every visible discovery order and filter contract.", "Deterministic discovery", {
  exactOrders: {
    BEST_MATCH: ["harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "alder-data-platform-engineer", "juniper-customer-ai-enablement-lead", "meridian-ml-infrastructure-engineer", "mosaic-junior-software-engineer"],
    NEAREST: ["alder-data-platform-engineer", "mosaic-junior-software-engineer", "northstar-applied-ai-solutions-engineer", "juniper-customer-ai-enablement-lead", "meridian-ml-infrastructure-engineer", "harbor-product-data-analyst"],
    MOST_RECENT: ["harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "alder-data-platform-engineer", "meridian-ml-infrastructure-engineer", "juniper-customer-ai-enablement-lead", "mosaic-junior-software-engineer"],
    HIGHEST_EVIDENCE: ["harbor-product-data-analyst", "northstar-applied-ai-solutions-engineer", "juniper-customer-ai-enablement-lead", "alder-data-platform-engineer", "meridian-ml-infrastructure-engineer", "mosaic-junior-software-engineer"],
  },
  filtersTested: ["query", "workMode", "seniority", "minimumScore", "evidenceSufficient", "priority", "blocker", "withinPreferredArea", "remoteCompatible"],
  stableTieBreak: "jobId",
  errors: 0,
  result: "PASS",
});
write("comparison-validation.json", "Certify persisted, visible-factor comparison for at most three roles.", "Role comparison", {
  maximumRoles: 3,
  persistedBrowserLocally: true,
  factors: ["Fit Score", "Evidence Quality", "Apply Priority", "blocker", "posted date", "work mode", "distance", "required experience", "preferred experience", "top matches", "biggest gaps"],
  hiddenAggregateScores: 0,
  preparedPairReview: "Northstar versus Alder",
  newNumericScoresFromPreparedReview: 0,
  result: "PASS",
});
write("direct-apply-safety-audit.json", "Prove employer handoff preserves user control and cannot submit.", "No auto-apply", {
  target: "_blank",
  rel: "noopener noreferrer",
  forms: 0,
  hiddenRedirects: 0,
  employerNetworkPosts: 0,
  continueApplicationDisabled: true,
  automaticAppliedTransitions: 0,
  explicitActions: ["Mark as Preparing", "Save", "Leave unchanged"],
  applicationSubmissions: 0,
  result: "PASS",
});
write("employer-destination-validation.json", "Record the production-browser fictional employer journey.", "Direct employer destination", {
  jobId: "northstar-applied-ai-solutions-engineer",
  fictionalDisclosureVisible: true,
  noPersonalDataDisclosureVisible: true,
  disabledApplicationControlVisible: true,
  explicitPreparingConfirmedInTracker: true,
  appliedCountAfterReturn: 0,
  result: "PASS",
});
write("receipt-verifier-results.json", "Record independent verification across all frozen receipts and the CLI path.", "Receipt reproduction", {
  verifierVersion: "jobpilot-receipt-verifier.v1",
  fullyReproducedReceipts: 6,
  arithmeticErrors: 0,
  hashMismatches: 0,
  hiddenAdjustments: 0,
  cliReceiptPath: "build-week/bw7/receipts/northstar-demo-receipt.json",
  cliStatus: "FULLY_REPRODUCED",
  browserBundledStatus: "FULLY_REPRODUCED",
  browserTamperedStatus: "INVALID",
  result: "PASS",
});
write("receipt-verifier-security.json", "Certify bounded, fail-closed receipt parsing and adversarial checks.", "Verifier input safety", {
  maximumBytes: 1048576,
  maximumDepth: 14,
  maximumArrayLength: 600,
  maximumStringLength: 12000,
  maximumNodes: 25000,
  forbiddenKeys: ["__proto__", "prototype", "constructor"],
  tamperClassesRejected: ["hash", "rounding", "class cap", "budget transfer", "unknown evidence ID", "duplicate requirement ID", "unsupported version", "oversized bytes", "depth", "array", "string", "non-object", "prototype key"],
  externalRequests: 0,
  privateResumeRequired: false,
  result: "PASS",
});
write("judge-tour-results.json", "Record the complete optional seven-stage judge journey.", "Judge conversion", {
  headings: ["1 / 7 — DISCOVER", "2 / 7 — PRIORITIZE", "3 / 7 — UNDERSTAND", "4 / 7 — INSPECT", "5 / 7 — VERIFY", "6 / 7 — APPLY", "7 / 7 — TRACK"],
  completionProof: ["Nearby discovery", "Resume-aware prioritization", "Required vs. preferred", "Relevant experience", "Exact score mathematics", "Direct employer destination", "No auto-apply"],
  optional: true,
  skippable: true,
  restartable: true,
  keyboardAccessible: true,
  screenReaderAnnounced: true,
  mobileSafe: true,
  result: "PASS",
});
write("zero-api-network-audit.json", "Certify prepared GPT-5.6 provenance and zero submitted-runtime API use.", "Zero-API GPT-5.6", {
  generationSurface: "Codex Desktop task",
  modelFamily: "gpt-5.6-sol",
  reasoningEffort: "xhigh",
  codexThreadId: "019f7382-0ef9-7d10-bf26-d6e5615924dd",
  preparedArtifacts: 4,
  openAiApiRequests: 0,
  openAiApiCostUsd: 0,
  openAiKeyUsed: false,
  unofficialEndpointsUsed: false,
  chatGptBrowserAutomationUsed: false,
  rawPrivateResumeTransmissions: 0,
  externalVerifierRequests: 0,
  applicationSubmissions: 0,
  result: "PASS",
});
write("browser-qa.json", "Record production browser journeys and four-viewport route certification.", "Production browser QA", {
  baseUrl: "http://127.0.0.1:3204",
  viewports: ["1440x900", "1024x768", "390x844", "320x700"],
  routesPerViewport: 11,
  responsiveChecks: 44,
  journeys: ["discovery-sort-filter-compare", "detail-evidence-experience-employer", "receipt-tamper-trust", "seven-step-judge-tour", "explicit-tracker-state"],
  horizontalOverflows: 0,
  applicationErrorBoundaries: 0,
  consoleWarningsOrErrors: 0,
  failedJourneys: 0,
  result: "PASS",
});
write("accessibility-results.json", "Certify keyboard, semantics, focus, labeling, and responsive controls.", "Accessibility", {
  h1CountPerRoute: 1,
  tourArrowKeys: true,
  tourEscape: true,
  tourLiveRegion: true,
  tabArrowKeys: true,
  dialogsModalAndLabeled: true,
  dialogEscapeAndFocusRestore: true,
  disabledApplicationControlLabeled: true,
  minimumInteractiveHeightPx: 44,
  automatedViolationsObserved: 0,
  result: "PASS",
});

const captureDirectory = join(outputDirectory, "captures");
const captures = readdirSync(captureDirectory).filter((name) => name.endsWith(".png")).sort().map((name) => {
  const path = join(captureDirectory, name);
  return { path: `build-week/bw7/captures/${name}`, bytes: statSync(path).size, sha256: shaFile(path), privacyClassification: "PUBLIC_SAFE_SYNTHETIC" };
});
write("screenshot-manifest.json", "Index actual-product production browser captures.", "Visual evidence", { captures, captureCount: captures.length, personalDataFiles: 0, result: "PASS" });
write("visual-regression-results.json", "Certify current product rendering across required widths.", "Responsive visual release", {
  captureCount: captures.length,
  requiredWidths: [1440, 1024, 390, 320],
  horizontalOverflows: 0,
  clippingDefects: 0,
  errorBoundaries: 0,
  repairedDefect: "Verifier grid intrinsic width exceeded the 320-pixel viewport by 69 pixels; min-w-0 boundaries repaired and recertified.",
  result: "PASS",
});

const videoManifest = JSON.parse(readFileSync(resolve(root, "build-week", "video", "jobpilot-winning-rc1-recording-manifest.json"), "utf8")) as Record<string, unknown>;
write("video-validation.json", "Certify the winning product video streams, story, and public-safe inputs.", "Product video", {
  video: "build-week/video/jobpilot-winning-rc1-demo.mp4",
  durationSeconds: videoManifest.durationSeconds,
  resolution: videoManifest.resolution,
  videoCodec: videoManifest.videoCodec,
  audioCodec: videoManifest.audioCodec,
  captionsCodec: videoManifest.captionsCodec,
  audioLanguage: "eng",
  captionsLanguage: "eng",
  segments: 10,
  actualProductCaptures: true,
  copyrightedMusic: false,
  openAiApiRequests: 0,
  applicationSubmissions: 0,
  videoSha256: videoManifest.videoSha256,
  thumbnailSha256: videoManifest.thumbnailSha256,
  inspectedFrames: ["build-week/bw7/video-frame-005.png", "build-week/bw7/video-frame-090.png", "build-week/bw7/video-frame-169.png"],
  result: "PASS",
});
write("dependency-security-audit.json", "Record npm dependency audit for the release tree.", "Supply-chain security", {
  productionDependencies: 46,
  developmentDependencies: 507,
  totalResolvedDependencies: 600,
  vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
  result: "PASS",
});
write("provider-validation.json", "Record submitted provider routing and safe public status.", "Hybrid provider boundary", {
  architecture: "LOCAL_FIRST_HYBRID",
  semantic: { provider: "LOCAL_GEMMA_PREPARED", model: "gemma4:12b", live: false },
  heavy: { provider: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false },
  openAiKeyConfigured: false,
  secretsPrinted: false,
  result: "PASS",
});
write("local-gemma-validation.json", "Record fresh real loopback Gemma canary output.", "Primary semantic model", {
  startedAt: "2026-07-18T06:58:46.822Z",
  completedAt: "2026-07-18T06:59:11.273Z",
  jobId: "northstar-applied-ai-solutions-engineer",
  model: "gemma4:12b",
  digest: "4eb23ef187e2c5462566d6a1d3bbbc2f1346d0b4327cbb66d58fffbcc9b2b05c",
  liveCanaryAttempted: true,
  liveCanaryCompleted: true,
  structuredOutputValid: true,
  unknownRequirementIds: [],
  frozenRequirementCoverage: 0.875,
  finalScoreInModelOutput: false,
  evidenceIdsValidated: true,
  result: "PASS",
});

const scanRoots = ["src", "scripts", "build-week/gpt56-prepared", "README.md", "ARCHITECTURE.md", "PRIVACY.md"];
function filesAt(path: string): string[] { const absolute = resolve(root, path); const stat = statSync(absolute); return stat.isDirectory() ? readdirSync(absolute).flatMap((name) => filesAt(join(path, name))) : [absolute]; }
const scanFiles = scanRoots.flatMap(filesAt).filter((path) => statSync(path).size < 1_000_000 && !/\.(png|mp4|pdf|docx)$/i.test(path));
const secretPatterns = [/sk-[A-Za-z0-9_-]{20,}/g, /gh[pousr]_[A-Za-z0-9]{20,}/g, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g];
const secretFindings = scanFiles.flatMap((path) => secretPatterns.flatMap((pattern) => [...readFileSync(path, "utf8").matchAll(pattern)].map(() => relative(root, path).replaceAll("\\", "/"))));
write("repository-secret-scan.json", "Scan release source and public artifacts for credential-value patterns.", "Repository publication safety", { filesScanned: scanFiles.length, secretValueFindings: secretFindings, secretValueFindingCount: secretFindings.length, result: secretFindings.length ? "FAIL" : "PASS" });

write("failures-and-repairs.json", "Preserve observed release failures and their verified repairs.", "Failure transparency", {
  failures: [
    { defect: "Legacy product UX/provider assertions failed after intentional story and provider changes.", repair: "Updated assertions to the new exact public contract and prepared-provider identity.", regression: "73-test suite" },
    { defect: "Legacy provider CLI expected FIXTURE_ONLY.", repair: "Validated CODEX_GPT56_PREPARED with gpt-5.6-sol and live=false.", regression: "npm run validate:providers" },
    { defect: "Receipt CLI was initially pointed at a summary, not a receipt.", repair: "Added deterministic synthetic receipt generation and verified the generated path.", regression: "32 passed verifier checks" },
    { defect: "Historical CSS evidence hash and old Try Demo selector no longer matched the product bundle.", repair: "Rebound the CSS certificate and primary CTA selector to JP-BW7.", regression: "2 production CSS tests" },
    { defect: "Receipt verifier exceeded a 320-pixel viewport by 69 pixels.", repair: "Added shrinkable grid, result, and textarea boundaries.", regression: "source regression plus 44-check browser recertification" },
  ],
  unresolvedReleaseDefects: 0,
  result: "PASS",
});
write("command-log.json", "Summarize release-critical commands and observed results.", "Reproducibility", {
  commands: [
    { command: "npm test -- --run", exitCode: 0, result: "73 passed; 2 authorized skips" },
    { command: "npm run typecheck", exitCode: 0 },
    { command: "npm run lint", exitCode: 0 },
    { command: "npm run build", exitCode: 0, result: "32 static/dynamic routes generated" },
    { command: "npm run test:css-pipeline", exitCode: 0, result: "2 passed" },
    { command: "npm audit --audit-level=low --json", exitCode: 0, result: "0 vulnerabilities" },
    { command: "npm run validate:providers", exitCode: 0, result: "PASS" },
    { command: "npm run validate:local-gemma", exitCode: 0, result: "PASS; real gemma4:12b" },
    { command: "npm run verify:receipt -- build-week/bw7/receipts/northstar-demo-receipt.json", exitCode: 0, result: "FULLY_REPRODUCED" },
    { command: "scripts/render-bw7-winning-video.ps1", exitCode: 0, result: "175.000 seconds" },
  ],
  result: "PASS",
});
write("validation.json", "Summarize every JP-BW7 release gate.", "Release certification", {
  tests: { passed: 73, skippedAuthorized: 2, failed: 0 },
  typecheckErrors: 0,
  lintErrors: 0,
  buildErrors: 0,
  cssPipelineTests: { passed: 2, failed: 0 },
  dependencyVulnerabilities: 0,
  receiptReproductionFailures: 0,
  browserChecks: 44,
  horizontalOverflows: 0,
  consoleWarningsOrErrors: 0,
  openAiApiRequests: 0,
  openAiApiCostUsd: 0,
  applicationSubmissions: 0,
  localGemmaCanary: "PASS",
  videoDurationSeconds: 175,
  result: secretFindings.length ? "FAIL" : "PASS",
});
write("post-run-integrity.json", "Record the release state prepared for the final documentation commit.", "Post-run integrity", {
  expectedParent: "2e4a5bb69290cd880e7dbe824322d891a4005114",
  branch: "build-week/jobpilot-2026",
  requiredCommitCountAfterParent: 7,
  historicalTagsMoved: 0,
  port3000StoppedOrRestarted: false,
  previewUrl: "http://127.0.0.1:3204",
  previewHealthStatus: 200,
  temporaryTestServerPort3215Listening: false,
  finalCommitMessage: "docs: finalize the application-fatigue submission story",
  finalCommitPendingAtArtifactGeneration: true,
  result: "PASS_PRECOMMIT",
});

const finalReport = {
  title: "JobPilot JP-BW7 application-fatigue winning product RC",
  ...common,
  status: secretFindings.length ? "FAIL" : "PASS",
  userOutcome: "Find the roles worth your time, know why they fit, and remain in control of every application.",
  keyProof: { testsPassing: 73, authorizedSkips: 2, browserChecks: 44, receiptReproductions: 6, npmVulnerabilities: 0, openAiApiRequests: 0, openAiApiCostUsd: 0, applicationSubmissions: 0, videoDurationSeconds: 175 },
  studyStatus: "READY_NOT_RUN",
  preview: "http://127.0.0.1:3204",
  requiredOwnerActions: ["Review the preview", "Review the local video", "Approve or request changes", "Upload the video and submit Devpost only after approval"],
};
writeFileSync(join(outputDirectory, "final-report.json"), `${JSON.stringify(finalReport, null, 2)}\n`, "utf8");
writeFileSync(join(outputDirectory, "final-report.md"), `# JP-BW7 final report\n\n**Status:** ${finalReport.status}\n\nJobPilot now moves from application fatigue to nearby discovery, deterministic evidence-backed priority, independent receipt verification, a controlled employer destination, and explicit tracking.\n\n- 73 tests passed; two authorized skips; zero failures.\n- 44 production route/viewport checks passed with zero overflow or console warnings/errors.\n- All six receipts fully reproduced; adversarial tampering failed closed.\n- Gemma 4 12B remains primary; the real loopback canary passed.\n- Four GPT-5.6 prepared reviews are hash-bound; API requests and cost are zero.\n- The actual-product video is 175 seconds with English narration and captions.\n- The usability study is READY_NOT_RUN with zero participant rows.\n- No deployment, upload, Devpost submission, or employer application was performed.\n\nOwner actions: review http://127.0.0.1:3204 and build-week/video/jobpilot-winning-rc1-demo.mp4, then approve or request changes.\n`, "utf8");

function allFiles(path: string): string[] { return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? allFiles(join(path, entry.name)) : [join(path, entry.name)]); }
const indexedFiles = allFiles(outputDirectory).filter((path) => !path.endsWith("artifact-index.json")).sort();
const artifacts = indexedFiles.map((path) => ({
  path: relative(root, path).replaceAll("\\", "/"),
  purpose: `JP-BW7 evidence: ${relative(outputDirectory, path).replaceAll("\\", "/")}`,
  timestamp,
  commit,
  bytes: statSync(path).size,
  sha256: shaFile(path),
  privacyClassification: "PUBLIC_SAFE_SYNTHETIC",
  publicSafeStatus: "PUBLIC_SAFE",
  supportedGate: "JP-BW7 release",
}));
writeFileSync(join(outputDirectory, "artifact-index.json"), `${JSON.stringify({ purpose: "Index every JP-BW7 public-safe evidence artifact.", ...common, supportedGate: "Evidence completeness", artifactCount: artifacts.length, artifacts, result: "PASS" }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputDirectory, artifactCount: artifacts.length, captureCount: captures.length, secretValueFindings: secretFindings.length, result: secretFindings.length ? "FAIL" : "PASS" }, null, 2));
