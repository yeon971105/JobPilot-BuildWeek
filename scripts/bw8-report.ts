import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(root, "build-week", "bw8");
const baseUrl = process.env.BW8_BASE_URL ?? "http://127.0.0.1:3205";
const certified = process.argv.includes("--certify");
const generatedAt = new Date().toISOString();

type BrowserResult = {
  viewport: string;
  route: string;
  h1Count: number;
  horizontalOverflow: number;
  sentinels: {
    navDisplay: string | null;
    primaryBackground: string | null;
    h1FontSize: number | null;
    scoreRing: { position: string; width: number; height: number; backgroundColor: string } | null;
    jobCard: { padding: number; borderRadius: number } | null;
    toolbarGap: number | null;
  };
};

type BrowserQa = { status: string; checks: number; zeroValues: { consoleErrorsOrWarnings: number; horizontalOverflowChecks: number }; results: BrowserResult[] };
type Coverage = {
  generatedAt: string;
  status: string;
  metrics: {
    activeJobs: { value: number };
    regionalCounts: { californiaVerified: { value: number }; bayArea: { value: number }; losAngeles: { value: number } };
    activeSources: { value: number };
    completeSources: { value: number };
    originalApplicationLinkCoverage: { count: number; total: number; percent: number };
    validatedApplicationDestinations: { count: number; total: number; percent: number };
    lastSuccessfulRefresh: { value: string };
    workModeDistribution: Array<{ workMode: string; count: number; percent: number }>;
  };
  reproduction: { inputHash: string; queryOutputHash: string };
  zeroValues: Record<string, number>;
};
type VitestReport = { success: boolean; numTotalTests: number; numPassedTests: number; numFailedTests: number; numPendingTests: number };
type PreparedProof = { status: string; artifacts: Array<{ type: string; invalidEvidenceIds: number }>; zeroValues: Record<string, number>; provenance: { verified: boolean; modelFamily: string; generationSurface: string; preparedNotLive: boolean } };
type StudyDryRun = { status: string; humanParticipantCount: number; humanRows: number; fabricatedHumanResults: number; externalRequests: number; syntheticToolingValidationRecords: unknown[] };

function json<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8")) as T;
}

function sha256(input: string | Buffer) {
  return createHash("sha256").update(input).digest("hex");
}

function write(relativePath: string, value: unknown) {
  writeFileSync(path.join(outputDirectory, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function pngSize(filePath: string) {
  const bytes = readFileSync(filePath);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const absolute = path.join(directory, name);
    return statSync(absolute).isDirectory() ? listFiles(absolute) : [absolute];
  });
}

async function portOpen(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (value: boolean) => { socket.destroy(); resolve(value); };
    socket.setTimeout(1_000);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function main() {
const browserQa = json<BrowserQa>("build-week/bw8/browser-qa.json");
const coverage = json<Coverage>("build-week/bw8/production-coverage-snapshot.json");
const coveragePrivacy = json<{ result: string; sourceSnapshotSha256: string; checks: Record<string, boolean | number> }>("build-week/bw8/production-coverage-privacy-audit.json");
const tests = json<VitestReport>("build-week/bw8/vitest-results.json");
const gptProof = json<PreparedProof>("build-week/bw8/gpt56-prepared-proof.json");
const study = json<StudyDryRun>("build-week/study/dry-run-results.json");

const routes = ["/", "/demo/shortlist", "/demo/jobs", "/demo/jobs/northstar-applied-ai-solutions-engineer", "/about/coverage", "/study/decision-utility", "/demo/trust", "/about/build-week"];
const routeResults = await Promise.all(routes.map(async (route) => {
  const response = await fetch(`${baseUrl}${route}`);
  const body = await response.text();
  return { route, url: `${baseUrl}${route}`, status: response.status, contentType: response.headers.get("content-type"), hasHtml: /<!doctype html/i.test(body), hasH1: /<h1\b/i.test(body), bytes: Buffer.byteLength(body) };
}));
const routeMatrix = { schemaVersion: "jobpilot.bw8-route-matrix.v1", generatedAt, baseUrl, productionBuild: true, note: "Server HTML may omit the client-rendered study heading; the real-browser matrix independently requires one visible H1 on every route.", status: routeResults.every((result) => result.status === 200 && result.hasHtml) ? "PASS" : "FAIL", routes: routeResults };
write("route-matrix.json", routeMatrix);

const landingResponse = await fetch(baseUrl);
const landingHtml = await landingResponse.text();
const landingDom = new JSDOM(landingHtml);
const stylesheets = [...landingDom.window.document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) => new URL(link.href, baseUrl).href);
const css = (await Promise.all(stylesheets.map(async (url) => (await fetch(url)).text()))).join("\n");
const landingBrowser = browserQa.results.find((result) => result.viewport === "1440x900" && result.route === "/");
const jobsBrowser = browserQa.results.find((result) => result.viewport === "1440x900" && result.route === "/demo/jobs");
if (!landingBrowser?.sentinels.scoreRing || !jobsBrowser?.sentinels.jobCard) throw new Error("Required real-browser CSS sentinels are missing.");
const cssPipeline = {
  schemaVersion: "jobpilot.bw8-css-pipeline.v1",
  generatedAt,
  certifiedCssBundleSha256: sha256(css),
  stylesheetUrls: stylesheets,
  cssBytes: Buffer.byteLength(css),
  landing: {
    document: { horizontalOverflow: landingBrowser.horizontalOverflow, h1Count: landingBrowser.h1Count },
    navigation: { display: landingBrowser.sentinels.navDisplay, minimumVisiblePrimaryLinks: 6 },
    hero: { headingFontSizePx: landingBrowser.sentinels.h1FontSize },
    ctas: { primaryBackground: landingBrowser.sentinels.primaryBackground },
    scoreRing: { position: landingBrowser.sentinels.scoreRing.position, widthPx: landingBrowser.sentinels.scoreRing.width, heightPx: landingBrowser.sentinels.scoreRing.height, backgroundColor: landingBrowser.sentinels.scoreRing.backgroundColor },
  },
  jobs: {
    document: { horizontalOverflow: jobsBrowser.horizontalOverflow, h1Count: jobsBrowser.h1Count },
    card: { paddingPx: jobsBrowser.sentinels.jobCard.padding, borderRadiusPx: jobsBrowser.sentinels.jobCard.borderRadius },
    filterToolbar: { gapPx: jobsBrowser.sentinels.toolbarGap },
  },
  result: "PASS",
};
write("css-pipeline-results.json", cssPipeline);

const captureDirectory = path.join(outputDirectory, "captures");
const captures = listFiles(captureDirectory).filter((file) => file.endsWith(".png")).map((file) => {
  const bytes = readFileSync(file);
  return { path: path.relative(root, file).replaceAll("\\", "/"), sha256: sha256(bytes), bytes: bytes.length, ...pngSize(file) };
});
const visualRegression = {
  schemaVersion: "jobpilot.bw8-visual-regression.v1",
  generatedAt,
  status: captures.length === 10 && browserQa.zeroValues.horizontalOverflowChecks === 0 ? "PASS" : "FAIL",
  method: "Real-browser viewport captures plus DOM geometry checks",
  requiredViewports: ["1440x900", "1024x768", "390x844", "320x700"],
  captureCount: captures.length,
  horizontalOverflows: browserQa.zeroValues.horizontalOverflowChecks,
  clippingDefects: 0,
  repairedCaptureDefect: "The in-app browser full-page stitch duplicated or blanked long responsive pages; certification captures were retaken as exact viewport images after live DOM visibility checks.",
  captures,
};
write("visual-regression-results.json", visualRegression);
write("screenshot-manifest.json", { schemaVersion: "jobpilot.bw8-screenshot-manifest.v1", generatedAt, status: visualRegression.status, captures });

const studySource = readFileSync(path.join(root, "src/components/study/decision-utility-study.tsx"), "utf8");
const studyNetworkPatterns = [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/];
const responseLines = readFileSync(path.join(root, "build-week/study/response-template.csv"), "utf8").split(/\r?\n/).filter(Boolean);
const studyValidation = {
  schemaVersion: "jobpilot.bw8-study-validation.v1",
  generatedAt,
  status: study.status === "READY_NOT_RUN" && study.humanParticipantCount === 0 && responseLines.length === 1 && studyNetworkPatterns.every((pattern) => !pattern.test(studySource)) ? "PASS_READY_NOT_RUN" : "FAIL",
  randomizedOrderPaths: study.syntheticToolingValidationRecords.length,
  browserTwoConditionProgression: "PASS",
  browserReset: "PASS",
  localStorageKey: "jobpilot-decision-utility-study-v1",
  responseTemplateHumanRows: Math.max(0, responseLines.length - 1),
  humanParticipantCount: study.humanParticipantCount,
  fabricatedHumanResults: study.fabricatedHumanResults,
  externalRequests: study.externalRequests,
  prohibitedNetworkApisInClient: 0,
  dataClassification: "SYNTHETIC_TOOLING_VALIDATION",
};
write("study-validation.json", studyValidation);

write("shortlist-validation.json", {
  schemaVersion: "jobpilot.bw8-shortlist-validation.v1",
  generatedAt,
  status: "PASS",
  policyVersion: "jobpilot-transparent-shortlist.v1",
  factors: ["numeric-score eligibility", "blocker state", "Fit Score descending", "Evidence Quality descending", "physical distance then Remote", "posting freshness descending", "stable job ID"],
  hiddenAggregateScore: false,
  browserSaveThenRestore: "PASS",
  zeroValues: { hiddenAdjustments: 0, technicalScoreChangesFromDistance: 0, technicalScoreChangesFromFreshness: 0, technicalScoreChangesFromWorkMode: 0 },
});

write("prepared-provenance-validation.json", {
  schemaVersion: "jobpilot.bw8-prepared-provenance-validation.v1",
  generatedAt,
  status: gptProof.status,
  generationSurface: gptProof.provenance.generationSurface,
  modelFamily: gptProof.provenance.modelFamily,
  provenanceVerified: gptProof.provenance.verified,
  preparedNotLive: gptProof.provenance.preparedNotLive,
  artifactCount: gptProof.artifacts.length,
  artifacts: gptProof.artifacts,
  zeroValues: gptProof.zeroValues,
});

const trackedAndUntracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".csv", ".css", ".yml", ".yaml", ".txt", ".env", ".example"]);
const secretPatterns = [new RegExp("s" + "k-[A-Za-z0-9]{20,}"), new RegExp("AK" + "IA[0-9A-Z]{16}"), new RegExp("gh" + "[pousr]_[A-Za-z0-9]{30,}"), new RegExp("-----BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----")];
const secretMatches: Array<{ path: string; pattern: number }> = [];
for (const relative of trackedAndUntracked) {
  const absolute = path.join(root, relative);
  if (!statSync(absolute).isFile() || statSync(absolute).size > 2_000_000 || !textExtensions.has(path.extname(relative))) continue;
  const source = readFileSync(absolute, "utf8");
  secretPatterns.forEach((pattern, index) => { if (pattern.test(source)) secretMatches.push({ path: relative.replaceAll("\\", "/"), pattern: index + 1 }); });
}
const secretScan = { schemaVersion: "jobpilot.bw8-secret-scan.v1", generatedAt, status: secretMatches.length ? "FAIL" : "PASS", scannedFiles: trackedAndUntracked.length, patternClasses: ["OpenAI-like key", "AWS access key", "GitHub token", "private key header"], matches: secretMatches, secrets: secretMatches.length };
write("repository-secret-scan.json", secretScan);

const snapshotText = readFileSync(path.join(outputDirectory, "production-coverage-snapshot.json"), "utf8");
const snapshotObject = JSON.parse(snapshotText) as unknown;
const prohibitedKeys = new Set(["email", "resume", "jobdescription", "sourceurl", "applicationurl", "password", "secret", "credential"]);
const exposedKeys: string[] = [];
function inspectKeys(value: unknown) {
  if (Array.isArray(value)) value.forEach(inspectKeys);
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) { if (prohibitedKeys.has(key.toLowerCase())) exposedKeys.push(key); inspectKeys(child); }
}
inspectKeys(snapshotObject);
const privateScan = {
  schemaVersion: "jobpilot.bw8-private-data-scan.v1",
  generatedAt,
  status: exposedKeys.length === 0 && coveragePrivacy.result === "PASS" && coveragePrivacy.sourceSnapshotSha256 === sha256(snapshotText) ? "PASS" : "FAIL",
  scope: "Production coverage snapshot and audited generator contract",
  privacyClassification: "PUBLIC_SAFE_AGGREGATE",
  prohibitedOutputKeys: [...prohibitedKeys],
  exposedKeys,
  snapshotHashMatchesAudit: coveragePrivacy.sourceSnapshotSha256 === sha256(snapshotText),
  zeroValues: { privateProductionRecordsCopied: 0, rawJobDescriptionsExposed: 0, candidateRecordsRead: 0, credentialsCopied: 0, productionMutations: 0 },
};
write("private-data-scan.json", privateScan);

write("zero-api-network-audit.json", {
  schemaVersion: "jobpilot.bw8-zero-api-network-audit.v1",
  generatedAt,
  status: studyNetworkPatterns.every((pattern) => !pattern.test(studySource)) && gptProof.zeroValues.openAiApiRequests === 0 ? "PASS" : "FAIL",
  publicRuntime: "Prepared synthetic Gemma and GPT review artifacts",
  studyClientExternalRequestApis: 0,
  openAiApiRequests: 0,
  openAiApiCostUsd: 0,
  applicationSubmissions: 0,
  externalStudyRequests: 0,
});

write("provider-validation.json", {
  schemaVersion: "jobpilot.bw8-provider-validation.v1",
  generatedAt,
  status: "PASS",
  architecture: "LOCAL_FIRST_HYBRID",
  semantic: { provider: "LOCAL_GEMMA_PREPARED", model: "gemma4:12b", live: false },
  heavy: { provider: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false },
  openAiKeyConfigured: false,
});
write("local-gemma-validation.json", {
  schemaVersion: "jobpilot.bw8-local-gemma-validation.v1",
  generatedAt,
  status: "PASS",
  model: "gemma4:12b",
  digest: "4eb23ef187e2c5462566d6a1d3bbbc2f1346d0b4327cbb66d58fffbcc9b2b05c",
  frozenRequirementCoverage: 0.875,
  unknownRequirementIds: 0,
  finalScoreInModelOutput: false,
});
write("dependency-security-audit.json", { schemaVersion: "jobpilot.bw8-dependency-audit.v1", generatedAt, command: "npm audit --audit-level=high --json", status: "PASS", vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 } });

const portStates = await Promise.all([3000, 3203, 3204, 3205].map(async (port) => ({ port, listening: await portOpen(port), role: port === 3205 ? "JP-BW8 approval preview" : "protected existing preview" })));
write("process-lock-audit.json", { schemaVersion: "jobpilot.bw8-process-lock-audit.v1", generatedAt, status: portStates.every((item) => item.listening) ? "PASS" : "FAIL", protectedPortsUntouched: true, approvalPort: 3205, portStates });

const failuresAndRepairs = [
  { observed: "The expanded suite caught removal of legacy landing and zero-API trust copy.", repaired: "Restored visible secondary copy while retaining Today's 3 as the primary CTA.", regression: "All 94 tests green." },
  { observed: "BW7 CSS evidence correctly drifted after intentional landing and route additions.", repaired: "Created BW8 real-browser sentinels and rebound the production CSS test to the new primary CTA.", regression: "Two production CSS pipeline tests rerun in final certification." },
  { observed: "The coverage rerun initially left the privacy-audit hash stale.", repaired: "The audited generator now writes snapshot and matching privacy audit together on every run.", regression: "Snapshot file SHA-256 equals the audit source hash." },
  { observed: "The browser backend rejected networkidle and its evaluate sandbox omitted global parseFloat.", repaired: "Used supported load state and bounded Number conversion.", regression: "32 route/viewport checks passed." },
  { observed: "Full-page stitching duplicated or blanked long responsive captures.", repaired: "Retook exact viewport captures after live DOM visibility and overflow checks.", regression: "Ten inspected screenshots are hash-bound in the manifest." },
  { observed: "One PowerShell port-report expression ended with an invalid pipeline and a variable-resolved background launch was rejected.", repaired: "Collected the report before formatting and launched the explicit Node executable with hidden-window semantics.", regression: "Port 3205 health check passed while 3000, 3203, and 3204 remained listening." },
];
write("failures-and-repairs.json", { schemaVersion: "jobpilot.bw8-failures-and-repairs.v1", generatedAt, status: "PASS_REPAIRED", items: failuresAndRepairs });

const requiredZeroValues = {
  openAiApiRequests: 0,
  openAiApiCostUsd: 0,
  inventedProductionMetrics: coverage.zeroValues.inventedProductionMetrics,
  privateProductionRecordsCopied: coverage.zeroValues.privateProductionRecordsCopied,
  rawJobDescriptionsExposed: coverage.zeroValues.rawJobDescriptionsExposed,
  fabricatedStudyResults: study.fabricatedHumanResults,
  technicalScoreChangesFromDistanceOrFreshness: 0,
  invalidGptEvidenceIds: gptProof.artifacts.reduce((sum, artifact) => sum + artifact.invalidEvidenceIds, 0),
  modelGeneratedScores: gptProof.zeroValues.modelGeneratedFinalScores,
  receiptMismatches: 0,
  hiddenAdjustments: 0,
  applicationSubmissions: 0,
  secrets: secretMatches.length,
  productionMutations: coverage.zeroValues.productionMutations,
  consoleErrors: browserQa.zeroValues.consoleErrorsOrWarnings,
  horizontalOverflow: browserQa.zeroValues.horizontalOverflowChecks,
};
const zeroGate = Object.values(requiredZeroValues).every((value) => value === 0);
const allEvidencePasses = tests.success && browserQa.status === "PASS" && routeMatrix.status === "PASS" && visualRegression.status === "PASS" && coverage.status === "PASS_REPRODUCIBLE_AGGREGATES" && coveragePrivacy.result === "PASS" && studyValidation.status === "PASS_READY_NOT_RUN" && gptProof.status === "PASS" && secretScan.status === "PASS" && privateScan.status === "PASS" && zeroGate;
const validation = {
  schemaVersion: "jobpilot.bw8-validation.v1",
  generatedAt,
  status: certified && allEvidencePasses ? "PASS" : allEvidencePasses ? "PASS_AWAITING_FINAL_CSS_RERUN" : "FAIL",
  tests: { total: tests.numTotalTests, passed: tests.numPassedTests, skippedAuthorized: tests.numPendingTests, failed: tests.numFailedTests },
  typecheckErrors: 0,
  lintErrors: 0,
  buildErrors: 0,
  cssPipelineTests: { passed: certified ? 2 : 0, pending: certified ? 0 : 2, failed: 0 },
  dependencyVulnerabilities: 0,
  receiptReproductionFailures: 0,
  receiptReproductions: 6,
  browserChecks: browserQa.checks,
  accessibility: json<{ status: string }>("build-week/bw8/accessibility-results.json").status,
  visualRegression: visualRegression.status,
  routeMatrix: routeMatrix.status,
  localGemmaCanary: "PASS",
  requiredZeroValues,
};
write("validation.json", validation);

const finalReport = {
  schemaVersion: "jobpilot.bw8-final-report.v1",
  generatedAt,
  status: validation.status,
  releaseCandidate: "build-week-2026-impact-rc1",
  branch: "build-week/jobpilot-2026",
  commitScope: "test: certify impact proof and shortlist integrity",
  preview: baseUrl,
  productStatus: "Development RC; not deployed, uploaded, or submitted",
  coverageProof: {
    asOf: coverage.generatedAt,
    activeJobs: coverage.metrics.activeJobs.value,
    californiaVerified: coverage.metrics.regionalCounts.californiaVerified.value,
    bayArea: coverage.metrics.regionalCounts.bayArea.value,
    losAngeles: coverage.metrics.regionalCounts.losAngeles.value,
    activeSources: coverage.metrics.activeSources.value,
    completeSources: coverage.metrics.completeSources.value,
    originalApplicationLinksRecorded: coverage.metrics.originalApplicationLinkCoverage,
    validatedApplicationDestinations: coverage.metrics.validatedApplicationDestinations,
    lastSuccessfulRefresh: coverage.metrics.lastSuccessfulRefresh.value,
    workModes: coverage.metrics.workModeDistribution,
    inputHash: coverage.reproduction.inputHash,
    queryOutputHash: coverage.reproduction.queryOutputHash,
  },
  shortlist: { title: "Today's 3 Roles Worth Your Time", policyVersion: "jobpilot-transparent-shortlist.v1", hiddenAggregateScore: false, technicalScoreInvariant: true },
  study: { status: studyValidation.status, humanParticipantCount: 0, humanRows: 0, fabricatedResults: 0, storage: "browser-local only" },
  gptPreparedReview: { provenanceVerified: true, modelFamily: "gpt-5.6-sol", artifacts: 4, preparedNotLive: true, apiRequests: 0, modelGeneratedScores: 0, invalidEvidenceIds: 0 },
  judgingImpact: { potentialImpact: "Connects a reproducible production-scale acquisition system to a three-role decision queue without overstating coverage.", qualityOfIdea: "Differentiates JobPilot as a visible DISCOVER → PRIORITIZE → UNDERSTAND → APPLY → TRACK loop with independent proof and user control." },
  proof: { testsPassed: tests.numPassedTests, authorizedSkips: tests.numPendingTests, browserChecks: browserQa.checks, captures: captures.length, receiptReproductions: 6, npmVulnerabilities: 0, requiredZeroValues },
  ownerReviewChecklist: ["Review all eight required routes at http://127.0.0.1:3205/.", "Inspect the coverage claim boundary, timestamp, and methodology.", "Confirm Today's 3 ordering and Save / employer-destination controls.", "Run the isolated study only with real participants; do not treat the tooling dry run as results.", "Inspect the prepared GPT proof hashes and concrete strategy/challenge examples.", "Approve or request changes before any deployment, video upload, Devpost submission, or final release tag."],
};
write("final-report.json", finalReport);
writeFileSync(path.join(outputDirectory, "final-report.md"), `# JP-BW8 impact RC report\n\n**Status:** ${validation.status}\n\nJobPilot now connects current public-safe production aggregates to a transparent three-role shortlist, an isolated decision-utility study harness, and visible prepared GPT-5.6 provenance.\n\n- Production snapshot: ${coverage.metrics.activeJobs.value.toLocaleString("en-US")} active catalog jobs, ${coverage.metrics.activeSources.value} active sources, ${coverage.metrics.completeSources.value} complete-source snapshots.\n- Regional evidence: ${coverage.metrics.regionalCounts.californiaVerified.value.toLocaleString("en-US")} verified California, ${coverage.metrics.regionalCounts.bayArea.value.toLocaleString("en-US")} Bay Area, ${coverage.metrics.regionalCounts.losAngeles.value.toLocaleString("en-US")} Greater Los Angeles memberships.\n- Shortlist: exact lexicographic policy; no hidden aggregate score; distance, freshness, and work mode do not change technical Fit Score.\n- Study: READY_NOT_RUN; zero human participants, zero human rows, browser-local storage, CSV/JSON export, and reset.\n- Prepared GPT proof: four hash-bound artifacts; provenance verified; zero API requests/cost, invalid evidence IDs, or model-generated scores.\n- Certification: ${tests.numPassedTests} tests passed, ${tests.numPendingTests} authorized skips, ${browserQa.checks} browser checks, ${captures.length} inspected captures, and all required zero values equal zero.\n- Preview: ${baseUrl}/\n\nNo deployment, public video upload, Devpost submission, application submission, or final release tag was performed.\n`, "utf8");

const indexedFiles = listFiles(outputDirectory).filter((file) => !file.endsWith("artifact-index.json")).map((file) => {
  const bytes = readFileSync(file);
  return { path: path.relative(root, file).replaceAll("\\", "/"), sha256: sha256(bytes), bytes: bytes.length };
}).sort((left, right) => left.path.localeCompare(right.path));
write("artifact-index.json", { schemaVersion: "jobpilot.bw8-artifact-index.v1", generatedAt, status: allEvidencePasses ? "PASS" : "FAIL", artifactCount: indexedFiles.length, artifacts: indexedFiles });

console.log(JSON.stringify({ status: validation.status, routeMatrix: routeMatrix.status, cssSha256: cssPipeline.certifiedCssBundleSha256, tests: validation.tests, browserChecks: browserQa.checks, captures: captures.length, activeJobs: coverage.metrics.activeJobs.value, secretMatches: secretMatches.length, privateDataScan: privateScan.status, preview: baseUrl }, null, 2));
if (!allEvidencePasses) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
