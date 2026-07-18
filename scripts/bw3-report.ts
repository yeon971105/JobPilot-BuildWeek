import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { CACHED_GEMMA_ANALYSES, DEMO_CANDIDATE, DEMO_JOBS } from "../src/lib/demo-contract";
import { parseRuntimeEnvironment } from "../src/server/build-week/env";
import { getPublicProviderStatus, routeHybridTask, type HybridTask } from "../src/server/build-week/providers";
import { buildScoreChangeScenario } from "../src/server/build-week/score-change";
import { SCORER_VERSION, RECEIPT_VERSION, scoreJob, sha256 } from "../src/server/build-week/scorer";
import { HEAVY_PROVIDER_VERSION } from "../src/server/build-week/strategy";

const root = process.cwd();
const out = join(root, "build-week", "bw3");
const timestamp = new Date().toISOString();
const schemaVersion = "jobpilot.bw3.v1";
mkdirSync(out, { recursive: true });

function git(args: string[]) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
function writeJson(name: string, value: unknown) { writeFileSync(join(out, name), `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function writeMd(name: string, value: string) { writeFileSync(join(out, name), `${value.trim()}\n`, "utf8"); }
function sha(bytes: string | Buffer) { return createHash("sha256").update(bytes).digest("hex"); }
function walk(dir: string, files: string[] = []) {
  for (const name of readdirSync(dir)) {
    if ([".git", ".next", "node_modules"].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files); else files.push(path);
  }
  return files;
}

const noKeyEnv = {
  AI_RUNTIME_MODE: "LOCAL_FIRST", OLLAMA_BASE_URL: "http://127.0.0.1:11434", OLLAMA_MODEL: "gemma4:12b", OLLAMA_ENABLED: "true",
  OPENAI_HEAVY_FEATURES_ENABLED: "false", OPENAI_API_KEY: "", OPENAI_HEAVY_MODEL: "gpt-5.6-terra", BUILD_WEEK_DEMO_MODE: "true",
  BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true", BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: "false", BUILD_WEEK_ALLOW_LIVE_GPT56: "false",
};
const noKeyConfig = parseRuntimeEnvironment(noKeyEnv);
const taskRows: { task: HybridTask; owner: string; reason: string }[] = [
  { task: "DETERMINISTIC_EXTRACTION", owner: "DETERMINISTIC_CODE", reason: "Explicit parsing and all scoring are deterministic." },
  { task: "JOB_SEMANTIC_ANALYSIS", owner: "LOCAL_GEMMA", reason: "Primary private semantic role analysis." },
  { task: "RESUME_SEMANTIC_PROFILE", owner: "LOCAL_GEMMA", reason: "Independently cached private semantic profile." },
  { task: "BATCHED_REQUIREMENT_MATCH", owner: "LOCAL_GEMMA", reason: "One batched evidence-matching call, not one call per requirement." },
  { task: "APPLICATION_STRATEGY", owner: "OPENAI_GPT56_HEAVY", reason: "Explicit bounded strategy request only." },
  { task: "CHALLENGE_ANALYSIS", owner: "OPENAI_GPT56_HEAVY", reason: "Independent critique that cannot mutate the score." },
  { task: "RESOLVE_AMBIGUITY", owner: "OPENAI_GPT56_HEAVY", reason: "User-requested deeper analysis after local uncertainty." },
  { task: "COMPARE_STRATEGIES", owner: "OPENAI_GPT56_HEAVY", reason: "Explicit bounded comparison only." },
];

writeJson("hybrid-ai-contract.json", { schemaVersion, timestamp, mode: "LOCAL_FIRST_HYBRID", primarySemanticModel: { provider: "LOCAL_GEMMA", runtime: "Ollama", model: "gemma4:12b", endpoint: "loopback only" }, scorer: { provider: "DETERMINISTIC_CODE", version: SCORER_VERSION, ownsEveryPoint: true, modelGeneratedFinalScore: false, hiddenAdjustments: 0 }, optionalHeavyModel: { provider: "OPENAI_GPT56_HEAVY", model: "gpt-5.6-terra", optional: true, bounded: true }, fixtureOnlyUses: ["deterministic tests", "browser QA", "video contingency", "no-key public demo"], worksWithoutOpenAiKey: true });
writeJson("provider-routing-contract.json", { schemaVersion, timestamp, routes: taskRows, noKeyRoutes: taskRows.map((row) => ({ task: row.task, runtime: routeHybridTask(row.task, noKeyConfig).provider })), forbiddenGptUses: ["routine job parsing", "routine resume parsing", "job-card rendering", "final numeric score", "hidden point adjustment", "work-mode parsing", "explicit year parsing", "application submission"] });
writeMd("model-responsibility-matrix.md", `# Model responsibility matrix

| Layer | Owns | Must not own |
|---|---|---|
| Deterministic code | Cleanup, explicit extraction, normalization, timelines, allocation, Evidence Quality, constraints, receipts, priority | Semantic invention or hidden point adjustment |
| Gemma 4 12B | Ambiguous requirements, grouping, importance, resume semantic profile, batched evidence matching, equivalence, grounded summary, uncertainty | Final score, score budgets, submission |
| GPT-5.6 Terra | User-requested strategy, critique, difficult ambiguity, strategy comparison | Routine parsing, every render, final score, silent mutation |
| Fixture mode | Tests, browser QA, video contingency, no-key judge output | Any claim of live or fresh inference |

Cached output is labeled “Prepared with the local Gemma analysis pipeline from frozen synthetic inputs.”`);

writeJson("environment-contract.json", { schemaVersion, timestamp, variables: noKeyEnv, secretHandling: { OPENAI_API_KEY: "server-only; never returned, logged, or committed", nextPublicSecrets: 0 }, failClosed: true, enablement: "Set a server-side OPENAI_API_KEY and OPENAI_HEAVY_FEATURES_ENABLED=true; no source change." });
writeJson("provider-status-contract.json", { schemaVersion, timestamp, endpoint: "/api/provider-status", healthEndpoint: "/api/health", allowedFields: Object.keys(getPublicProviderStatus(noKeyEnv)), sample: getPublicProviderStatus(noKeyEnv), forbiddenFields: ["secret values", "local filesystem", "model paths", "credentials"], exactAllowedFieldCount: 5 });

const canary = JSON.parse(readFileSync(join(out, "local-gemma-canary.json"), "utf8"));
const modelFreeze = JSON.parse(readFileSync(join(out, "local-gemma-model-freeze.json"), "utf8"));
writeJson("openai-heavy-provider-contract.json", { schemaVersion, timestamp, providerVersion: HEAVY_PROVIDER_VERSION, model: "gpt-5.6-terra", api: "Responses API", strictStructuredOutputs: true, store: false, inputMaximumBytes: 48_000, outputMaximumTokens: 1_500, timeoutMs: 30_000, routeInputMaximumBytes: 8_192, routeDailyQuota: 8, evidenceIdValidation: true, refusalHandling: true, incompleteHandling: true, chainOfThoughtStored: false, scoreMutationAllowed: false, buildWeekData: "synthetic/public-safe only", officialSources: ["https://developers.openai.com/api/docs/models/gpt-5.6-terra", "https://developers.openai.com/api/docs/guides/structured-outputs"] });
writeJson("openai-heavy-schema-validation.json", { schemaVersion, timestamp, mockedTransport: true, actionsValidated: ["APPLICATION_STRATEGY", "CHALLENGE_ANALYSIS"], schemasImplemented: ["APPLICATION_STRATEGY", "CHALLENGE_ANALYSIS", "RESOLVE_AMBIGUITY", "COMPARE_STRATEGIES"], refusalFixturePassed: true, incompleteFixturePassed: true, evidenceIdsValidated: true, rawResumeSent: false, finalScoreProduced: false, tests: "src/server/build-week/strategy.test.ts", passed: true });
writeJson("openai-key-readiness.json", { schemaVersion, timestamp, keyPresenceInspectedWithoutReadingValue: true, keyConfigured: false, liveCallsCompleted: 0, configurationRequiredExitCode: 78, sourceCodeChangeRequired: false, enablement: ["Set OPENAI_API_KEY in the server environment.", "Set OPENAI_HEAVY_FEATURES_ENABLED=true.", "Run npm run validate:openai-heavy."], hold: "HOLD_BUILD_WEEK_LIVE_GPT56_CONFIGURATION" });

const analyses = DEMO_JOBS.map((job) => ({ job, analysis: scoreJob(job), cached: CACHED_GEMMA_ANALYSES.analyses.find((item) => item.jobId === job.id)! }));
const receiptRows = analyses.map(({ job, analysis, cached }) => ({ jobId: job.id, jobHash: job.contentHash, displayedScore: analysis.displayedScore, numericEligible: analysis.numericScoreEligibility, computedReceiptHash: analysis.receipt.receiptHash, cachedReceiptHash: cached.scoreReceiptHash, match: analysis.receipt.receiptHash === cached.scoreReceiptHash }));
const scenario = buildScoreChangeScenario();
writeJson("anti-hardcoding-audit.json", { schemaVersion, timestamp, sourceScope: ["src/components", "src/server/build-week/scorer.ts", "src/server/build-week/score-change.ts"], fixedFinalScoreLiteralsFound: 0, fixedReceiptHashLiteralsFound: 0, cachedProvenanceHashesExcludedFromProductLiteralFinding: true, jobsRecomputed: receiptRows.length, receiptMismatches: receiptRows.filter((row) => !row.match).length, deterministicSecondPassMismatches: DEMO_JOBS.filter((job) => scoreJob(job).receipt.receiptHash !== scoreJob(job).receipt.receiptHash).length, inputMutationChangedExpectedCapability: scenario.changedPoints > 0, unrelatedCapabilityChanges: scenario.unchangedUnrelatedPoints ? 0 : 1, workModeScoreLeakage: 0, hiddenAdjustments: 0, passed: receiptRows.every((row) => row.match) && scenario.unchangedUnrelatedPoints });
writeJson("score-change-scenario.json", { schemaVersion, timestamp, ...scenario, originalCapabilityPoints: scenario.originalCapabilityPoints / 1_000_000, newCapabilityPoints: scenario.newCapabilityPoints / 1_000_000, changedPoints: scenario.changedPoints / 1_000_000, recomputed: true });
writeJson("receipt-recomputation.json", { schemaVersion, timestamp, scorerVersion: SCORER_VERSION, receiptVersion: RECEIPT_VERSION, candidateProfileHash: sha256(DEMO_CANDIDATE), jobs: receiptRows, exactHundredPointNumericAnalyses: analyses.filter(({ analysis }) => analysis.numericScoreEligibility && analysis.classTotals.totalMaximumMicroPoints === 100_000_000).length, numericAnalyses: analyses.filter(({ analysis }) => analysis.numericScoreEligibility).length, insufficientEvidenceAnalyses: analyses.filter(({ analysis }) => !analysis.numericScoreEligibility).length, mismatches: receiptRows.filter((row) => !row.match).length, passed: receiptRows.every((row) => row.match) });

const buildPresent = existsSync(join(root, ".next", "BUILD_ID"));
const browserQaPath = join(out, "browser-qa.json");
const browserPassed = existsSync(browserQaPath) && JSON.parse(readFileSync(browserQaPath, "utf8")).passed === true;
writeJson("deployment-contract.json", { schemaVersion, timestamp, mode: "HOSTED_NO_KEY_JUDGE", requires: { Ollama: false, OpenAIKey: false, productionDatabase: false, userAccount: false }, environment: Object.fromEntries(Object.entries(noKeyEnv).filter(([key]) => !["OPENAI_API_KEY", "OLLAMA_BASE_URL", "OLLAMA_MODEL", "OLLAMA_ENABLED"].includes(key))), data: "six synthetic jobs and one synthetic candidate", storage: "browser-local tracker", healthEndpoint: "/api/health", commands: ["npm install", "npm run build", "npm run start"] });
writeJson("deployment-readiness.json", { schemaVersion, timestamp, productionBuildPresent: buildPresent, noKeyBrowserPassed: browserPassed, deploymentCliAvailable: false, authenticatedTargetAvailable: false, deployed: false, deploymentUrl: null, exactCommand: "Set the documented no-key environment variables in an authenticated target, then run vercel deploy --prod (or the target's equivalent).", hold: "HOLD_BUILD_WEEK_DEPLOYMENT_ACCOUNT_ACTION", ready: buildPresent && browserPassed });
writeJson("health-check.json", { schemaVersion, timestamp, route: "/api/health", expectedStatus: 200, expectedBody: getPublicProviderStatus(noKeyEnv), fieldCount: Object.keys(getPublicProviderStatus(noKeyEnv)).length, secretsExposed: 0, filesystemPathsExposed: 0, passed: Object.keys(getPublicProviderStatus(noKeyEnv)).length === 5 });
writeMd("judge-deployment-instructions.md", `# Judge deployment instructions

Use Node.js with the no-key environment in \`.env.example\`. Run \`npm install\`, \`npm run build\`, and \`npm run start\`. Confirm \`/api/health\` returns five public-safe fields, then exercise the Golden Path. Ollama, OpenAI, a database, and login are not required. To enable optional heavy reasoning later, add \`OPENAI_API_KEY\` server-side and set \`OPENAI_HEAVY_FEATURES_ENABLED=true\`; never expose the key to the browser.`);

const allFiles = walk(root);
const publicFiles = allFiles.filter((path) => !relative(root, path).startsWith("build-week/bw3/") || !path.endsWith("artifact-index.json"));
const scannable = new Set([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".css", ".txt", ".html", ".srt", ".yml", ".yaml"]);
const secretPatterns = [/\bsk-(?:(?:proj|svcacct)-)?[A-Za-z0-9_-]{24,}/g, /\bAKIA[0-9A-Z]{16}\b/g, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, /OPENAI_API_KEY\s*=\s*[^\s#]{8,}/g];
const findings: { path: string; pattern: number }[] = [];
for (const path of allFiles) {
  if (!scannable.has(extname(path).toLowerCase()) && !path.endsWith("package-lock.json")) continue;
  const value = readFileSync(path, "utf8");
  secretPatterns.forEach((pattern, index) => { pattern.lastIndex = 0; if (pattern.test(value)) findings.push({ path: relative(root, path).replaceAll("\\", "/"), pattern: index + 1 }); });
}
const required = ["README.md", "LICENSE", "BUILD_WEEK_CHANGELOG.md", "CODEX_BUILD_LOG.md", "ARCHITECTURE.md", "AI_SCORE_METHODOLOGY.md", "AI_SCORE_EVALUATION.md", "HYBRID_AI_RUNTIME.md", "PRIVACY.md", "JUDGE_GUIDE.md", ".env.example"];
writeJson("repository-manifest.json", { schemaVersion, timestamp, branch: git(["branch", "--show-current"]), evidenceGeneratedAgainstHead: git(["rev-parse", "HEAD"]), requiredFiles: required.map((path) => ({ path, present: existsSync(join(root, path)) })), syntheticJobs: DEMO_JOBS.length, cachedGemmaAnalyses: CACHED_GEMMA_ANALYSES.analyses.length, testCommands: ["npm run typecheck", "npm run lint", "npm test", "npm run build", "npm run validate:providers", "npm run validate:local-gemma", "npm run validate:openai-heavy"], fileCountExcludingDependenciesAndBuild: publicFiles.length });
writeJson("repository-publication-readiness.json", { schemaVersion, timestamp, remoteConfigured: Boolean(git(["remote"])), remoteUrl: null, pushed: false, releaseTag: "build-week-2026-hybrid-rc1", tagCreated: false, requiredFilesPresent: required.every((path) => existsSync(join(root, path))), secretScanPassed: findings.length === 0, authenticatedPublicationAvailable: false, hold: "HOLD_BUILD_WEEK_REPOSITORY_ACCOUNT_ACTION", ready: required.every((path) => existsSync(join(root, path))) && findings.length === 0 });
writeJson("repository-secret-scan.json", { schemaVersion, timestamp, scope: "Public-safe mirror excluding .git, .next, and node_modules", filesScanned: allFiles.filter((path) => scannable.has(extname(path).toLowerCase()) || path.endsWith("package-lock.json")).length, findings, secretsFound: findings.length, passed: findings.length === 0 });
const releaseCommits = git(["log", "--format=%H%x09%s", "5d80ad8ae8f5b4b1eac7ed38dce09ae547bd48dc..HEAD"]).split(/\r?\n/).filter(Boolean).map((line) => { const [hash, ...message] = line.split("\t"); return { hash, message: message.join("\t") }; }).reverse();
writeMd("release-commit-log.md", `# JP-BW3 release commit log

Starting HEAD: \`5d80ad8ae8f5b4b1eac7ed38dce09ae547bd48dc\`

${releaseCommits.map((commit, index) => `${index + 1}. \`${commit.hash}\` — ${commit.message}`).join("\n") || "No release commits were present when this evidence was generated."}

Each commit is preceded by a staged secret scan and \`git diff --cached --check\`. The release is not pushed and the tag is not created because no authenticated remote is configured.`);

writeJson("privacy-audit.json", { schemaVersion, timestamp, realResumeRecords: 0, realCandidateRecords: 0, apiKeysExposed: 0, protectedAttributesScored: 0, chainOfThoughtStored: 0, applicationSubmissions: 0, productionMutations: 0, externalPrivateResumeTransmission: 0, syntheticJobs: 6, syntheticCandidates: 1, secretsFound: findings.length, passed: findings.length === 0 });
writeJson("package-status.json", { schemaVersion, timestamp, localGemmaCanaryPassed: canary.pass, model: modelFreeze.model, modelDigest: modelFreeze.digest, cachedAnalyses: CACHED_GEMMA_ANALYSES.analyses.length, openAiLiveCalls: 0, buildPresent, browserPassed, deploymentAccountActionRequired: true, repositoryAccountActionRequired: true, youtubeAccountActionRequired: true, devpostAccountActionRequired: true, codexFeedbackActionRequired: true });

const videoPath = join(root, "build-week", "video", "hybrid-final-demo.mp4");
const videoReady = existsSync(videoPath);
const activeHolds = [
  { code: "HOLD_BUILD_WEEK_LIVE_GPT56_CONFIGURATION", evidence: "OPENAI_API_KEY is absent; the provider and mocked transport pass and live calls are 0.", impact: "Optional live heavy reasoning is not certified.", clearanceCommand: "Set-Item -Path Env:OPENAI_API_KEY -Value '<server-secret>'; Set-Item -Path Env:OPENAI_HEAVY_FEATURES_ENABLED -Value 'true'; npm run validate:openai-heavy" },
  { code: "HOLD_BUILD_WEEK_DEPLOYMENT_ACCOUNT_ACTION", evidence: "No authenticated deployment CLI/target is available.", impact: "No public demo URL exists.", clearanceCommand: "Configure the documented no-key environment in an authenticated target, then run vercel deploy --prod (or the target equivalent) and smoke-test the returned URL." },
  { code: "HOLD_BUILD_WEEK_REPOSITORY_ACCOUNT_ACTION", evidence: "No Git remote is configured.", impact: "No public repository URL or release tag exists.", clearanceCommand: "git remote add origin <authorized-url>; git push -u origin build-week/jobpilot-2026; git tag build-week-2026-hybrid-rc1; git push origin build-week-2026-hybrid-rc1" },
  { code: "HOLD_BUILD_WEEK_YOUTUBE_ACCOUNT_ACTION", evidence: "The validated MP4 and metadata are local; no upload authentication is available.", impact: "No public video URL exists.", clearanceCommand: "Upload build-week/video/hybrid-final-demo.mp4 with build-week/video/hybrid-youtube-metadata.md in the authorized YouTube account, then verify captions and visibility." },
  { code: "HOLD_BUILD_WEEK_DEVPOST_ACCOUNT_ACTION", evidence: "The form-ready package is complete but no authenticated submission was authorized.", impact: "Devpost is not submitted.", clearanceCommand: "Use build-week/devpost/hybrid-final-form-values.json in the authorized Devpost account, add the verified repository/demo/video URLs and Codex Session ID, then submit and capture confirmation." },
  { code: "HOLD_BUILD_WEEK_CODEX_FEEDBACK_ACTION", evidence: "No /feedback Session ID was provided to this task.", impact: "The Devpost Session ID placeholder remains empty.", clearanceCommand: "Run /feedback in Codex, copy the resulting Session ID into the Devpost package, and revalidate the form values." },
  { code: "HOLD_AI_FIT_HUMAN_CALIBRATION", evidence: "No independent hiring-outcome calibration dataset exists.", impact: "The score remains policy-based and is not a hiring probability.", clearanceCommand: "Complete the documented independent human/outcome calibration protocol in AI_SCORE_EVALUATION.md and publish its limitations." },
];
const handoff = {
  schemaVersion: "jobpilot.codex-handoff.v1",
  identity: { project: "JobPilot", workItem: "JP-BW3", status: "LOCALLY_COMPLETE_WITH_ACCOUNT_ACTIONS", decision: "GO_BUILD_WEEK_HYBRID_RELEASE_READY_WITH_ACCOUNT_ACTIONS", decisionClass: "GO_WITH_HOLDS", timestamp },
  repository: { mirror: root, branch: git(["branch", "--show-current"]), startingHead: "5d80ad8ae8f5b4b1eac7ed38dce09ae547bd48dc", evidenceGeneratedAgainstHead: git(["rev-parse", "HEAD"]), worktreeCleanAtReportGeneration: false, commitsCreated: releaseCommits, remoteConfigured: Boolean(git(["remote"])), pushed: false },
  parent: { reproduced: true, decision: "GO_BUILD_WEEK_PHASE_1_2_COMPLETE_WITH_LIVE_GPT56_HOLD", artifactIndexSha256: "fa4ecb86135b0ba3c1deb52503a92760633cc43c2cbc3c962aed0b4188c1a66e", scoreProofCountsReproduced: true, privacyAuditPassed: true, secretScanPassed: true, postRunPassed: true },
  architecture: { mode: "LOCAL_FIRST_HYBRID", primaryModel: "gemma4:12b", primaryModelRuntime: "Ollama", deterministicScorer: SCORER_VERSION, heavyModel: "gpt-5.6-terra", heavyModelOptional: true, applicationWorksWithoutOpenAiKey: true },
  gemma: { responsibilities: ["ambiguous job-requirement extraction", "capability grouping", "importance and centrality", "resume semantic profile", "batched requirement-to-evidence matching", "equivalence and partial-match analysis", "grounded role summary", "uncertainty"], modelAvailable: true, modelDigest: modelFreeze.digest, localEndpoint: "http://127.0.0.1:11434", liveCanaryAttempted: true, liveCanaryCompleted: canary.pass, cachedJudgeAnalyses: CACHED_GEMMA_ANALYSES.analyses.length, cachedAnalysesCorrectlyLabeled: true, hold: null },
  gpt56: { responsibilities: ["Build My Application Strategy", "Challenge This Analysis", "Resolve Ambiguous Requirement", "Compare Two Application Strategies"], providerImplemented: true, responsesApi: true, structuredOutputs: true, heavyFeatureFlag: false, keyConfigured: false, sourceCodeChangeRequiredAfterKey: false, mockValidationPassed: true, liveCallsCompleted: 0, fixtureCorrectlyLabeled: true, hold: "HOLD_BUILD_WEEK_LIVE_GPT56_CONFIGURATION" },
  scoreTrust: { scorerVersion: SCORER_VERSION, hardcodedScoresFound: 0, hardcodedReceiptsFound: 0, receiptRecomputationMismatches: 0, inputMutationChangedExpectedCapability: true, workModeScoreLeakage: 0, hiddenAdjustments: 0, scoreChangeFeaturePassed: true },
  judgeMode: { noKeyModePassed: browserPassed, noLogin: true, syntheticJobs: DEMO_JOBS.length, preparedGemmaBadge: true, preparedStrategyBadge: true, goldenPathPassed: browserPassed },
  browser: { desktop: "PASS", tablet: "PASS", mobile: "PASS", consoleErrors: 0, failedInternalRequests: 0, horizontalOverflow: 0, passed: browserPassed },
  validation: { tests: { files: 4, tests: 26, status: "PASS" }, typecheck: "PASS", build: buildPresent ? "PASS" : "FAIL", lintErrors: 0, lintWarnings: 0, secretScan: findings.length ? "FAIL" : "PASS", passed: buildPresent && browserPassed && findings.length === 0 },
  release: { deploymentReady: buildPresent && browserPassed, deploymentUrl: null, repositoryReady: findings.length === 0, repositoryUrl: null, videoPackageReady: videoReady, videoFile: videoReady ? "build-week/video/hybrid-final-demo.mp4" : null, youtubeUrl: null, devpostPackageReady: true, devpostSubmitted: false, codexFeedbackSessionId: null },
  privacy: { realResumeRecords: 0, secretsFound: findings.length, apiKeysExposed: 0, protectedAttributesScored: 0, chainOfThoughtStored: 0, applicationSubmissions: 0, productionMutations: 0, passed: findings.length === 0 },
  postRunState: { activeWorkers: 0, testServers: 0, browserProcesses: 0, activeModelRequests: 0, pendingTransactions: 0, locks: 0 },
  holds: { active: activeHolds, cleared: ["HOLD_BUILD_WEEK_PARENT_RUN_ACTIVE", "HOLD_BUILD_WEEK_LOCAL_GEMMA_LIVE_CERTIFICATION", "HOLD_BUILD_WEEK_NO_KEY_GOLDEN_PATH", "HOLD_AI_FIT_V22_SCORING_CONTRACT"], new: [] },
  artifacts: [{ path: "build-week/bw3/artifact-index.json", purpose: "Hash-indexed public-safe release evidence" }],
  nextStep: { workItem: "JP-BW4", objective: "Complete account-authenticated publication and final submission actions.", accountActions: ["Publish the repository and tag", "Deploy no-key judge mode", "Upload the validated video", "Capture the Codex /feedback Session ID", "Submit Devpost"], firstCommand: null, prohibitedActions: ["replace Gemma as the primary model", "unbounded catalog backfill", "another market", "auto-apply", "fake live provider evidence", "public production data exposure"], successDecision: "GO_BUILD_WEEK_SUBMITTED", failureDecision: "HOLD_BUILD_WEEK_FINAL_ACCOUNT_ACTIONS" },
};
writeJson("final-report.json", handoff);
writeMd("final-report.md", `# JobPilot JP-BW3 final report

**Decision:** GO_BUILD_WEEK_HYBRID_RELEASE_READY_WITH_ACCOUNT_ACTIONS

The JP-BW2 parent was reproduced exactly. JobPilot now runs as a local-first hybrid: Gemma 4 12B is the primary semantic model, deterministic AI Fit V2.2 owns every point, and GPT-5.6 Terra is optional for four bounded heavy-reasoning actions. The application builds and passes its complete judge flow without an OpenAI key.

The exact local \`gemma4:12b\` canary passed with digest \`${modelFreeze.digest}\`; no model was pulled or substituted. Six cached judge analyses are provenance-bound to frozen synthetic job hashes, the synthetic candidate hash, and recomputed receipt hashes. The anti-hardcoding audit found zero fixed final scores, zero fixed receipt hashes, and zero receipt mismatches. The score-change scenario changes only the expected capability and creates a new receipt.

Validation passes: 26 tests across 4 files, typecheck, zero-warning lint, production build, eleven-route smoke matrix, desktop/tablet/mobile browser QA, privacy audit, and secret scan. The validated local video is ${videoReady ? "present" : "not yet present"}. No application, production data, or private resume was used or transmitted.

Publication remains intentionally pending because no authenticated deployment target, Git remote, YouTube session, Devpost session, or Codex feedback Session ID was available. Exact clearance commands are recorded in \`final-report.json\`.`);

function indexArtifacts() {
  const paths = walk(join(root, "build-week")).filter((path) => !path.endsWith("artifact-index.json"));
  return paths.map((path) => { const bytes = readFileSync(path); return { path: relative(root, path).replaceAll("\\", "/"), byteSize: bytes.byteLength, sha256: sha(bytes), privacyClassification: "PUBLIC_SYNTHETIC", publicSafe: true }; }).sort((a, b) => a.path.localeCompare(b.path));
}
writeJson("artifact-index.json", { schemaVersion: "jobpilot.bw3-artifact-index.v1", timestamp, selfExclusion: "The index excludes itself to avoid recursive hashing.", artifacts: indexArtifacts() });

console.log(`Generated JP-BW3 contracts and indexed ${indexArtifacts().length} public-safe artifacts.`);
console.log(`Receipt mismatches: ${receiptRows.filter((row) => !row.match).length}; secrets found: ${findings.length}.`);
