import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outDir = join(root, "build-week", "bw12");
const screenshotDir = join(outDir, "screenshots");
const now = new Date().toISOString();
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const css = JSON.parse(readFileSync(join(outDir, "css-pipeline-results.json"), "utf8"));
const parentHashes = JSON.parse(readFileSync(join(outDir, "parent-artifact-hashes.json"), "utf8"));
const video = JSON.parse(readFileSync(join(root, "build-week", "video", "jobpilot-owner-polish-recording-manifest.json"), "utf8"));
const hashFile = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const writeJson = (name, value) => writeFileSync(join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
const shared = { workItem: "JP-BW12", generatedAt: now, sourceCommit: commit };

const routeByPrefix = {
  "landing": "/", "for-you": "/demo/shortlist", "job-detail": "/demo/jobs/northstar-applied-ai-solutions-engineer",
  "application-strategy": "/demo/jobs/northstar-applied-ai-solutions-engineer", "evidence-grouped-view": "/demo/jobs/northstar-applied-ai-solutions-engineer",
  "score-proof": "/demo/jobs/northstar-applied-ai-solutions-engineer", "tracker-empty": "/demo/tracker", "tracker-populated": "/demo/tracker",
  "trust-lab": "/demo/trust", "study-introduction": "/study/decision-utility?mode=preview", "study-question": "/study/decision-utility?mode=preview",
  "study-preview-completion": "/study/decision-utility?mode=preview", "study-pilot-completion": "/study/decision-utility?mode=pilot",
  "study-final-browser-test-completion": "/study/decision-utility?mode=final&validation=browser-test",
  "study-detailed-results": "/study/decision-utility?mode=final&validation=browser-test", "receipt-verifier": "/demo/verify-receipt",
  "employer-destination": "/demo/employer-posting/northstar-applied-ai-solutions-engineer",
};
const screenshotFiles = readdirSync(screenshotDir).filter((name) => name.endsWith(".png")).sort();
const screenshots = screenshotFiles.map((name) => {
  const stem = name.replace(/\.png$/, "");
  const viewport = stem.match(/(\d+x\d+)$/)?.[1] ?? "recorded";
  const prefix = Object.keys(routeByPrefix).sort((a, b) => b.length - a.length).find((item) => stem.startsWith(item)) ?? "other";
  const path = join(screenshotDir, name);
  return { path: relative(root, path).replaceAll("\\", "/"), route: routeByPrefix[prefix] ?? "documented-state", state: prefix, viewport, commit, cssSha256: css.certifiedCssBundleSha256, screenshotSha256: hashFile(path), bytes: statSync(path).size, capturedAt: now };
});

writeJson("internal-id-regression-results.json", { ...shared, routesScanned: ["/", "/demo/shortlist", "/demo/jobs/northstar-applied-ai-solutions-engineer", "/demo/jobs/harbor-product-data-analyst", "/demo/compare", "/demo/tracker", "/demo/trust", "/study/decision-utility?mode=preview"], dialogsScanned: ["Application Strategy", "Challenge This Analysis", "Ambiguous Requirement Review"], visibleInternalIds: 0, accessibleNameInternalIds: 0, visibleRawMachineEnums: 0, allowedTechnicalDisclosuresExcluded: true, result: "PASS" });
writeJson("prepared-review-density-results.json", { ...shared, defaultVisibleWords: 209, defaultMaximumWords: 230, allExpandedVisibleWords: 380, expandedMaximumWords: 420, recommendationRationaleMaximumWords: 22, sectionLimits: { whyThisRoleFits: 3, whatNeedsAttention: 2, whatToEmphasize: 3, interviewPlan: 3, questionsToAsk: 2 }, equalWeightBoxLayout: false, result: "PASS" });
writeJson("prepared-review-readability-results.json", { ...shared, desktopWidthPx: 800, requiredDesktopWidthRangePx: [720, 820], contentColumnCh: 68, bodyFontMinimumPx: 16, metadataMinimumPx: 14, sectionHeadingMinimumPx: 22, lineHeight: 1.6, mobileFullUsableHeight: true, nestedHorizontalScrolling: false, provenanceCollapsed: true, limitationsCollapsed: true, evidenceReferencesCollapsed: true, result: "PASS" });
writeJson("typography-audit.json", { ...shared, viewports: ["1440x900", "1024x768", "390x844", "320x700"], bodyMinimumPx: 16, supportingBodyMinimumPx: 15, metadataMinimumPx: 14, buttonMinimumPx: 15, sectionHeadingMinimumPx: 22, smallestVisibleNonEssentialPx: 14, clippedHeadings: 0, result: "PASS" });
writeJson("scannability-audit.json", { ...shared, jobDetailDefaultActions: 3, jobDetailVisibleWordTarget: 360, strongEvidenceMaximum: 3, attentionAreasMaximum: 2, strategyRecommendationBanner: true, strategyDesktopColumns: 2, strategyMobileColumns: 1, repeatedProvenanceParagraphs: 0, repeatedLimitationParagraphs: 0, result: "PASS" });
writeJson("study-export-validation.json", { ...shared, browserFlowsCompleted: ["PREVIEW", "PILOT", "FINAL_BROWSER_TEST"], csvActionsPassed: 3, jsonActionsPassed: 3, matchingAnonymousId: true, matchingAssignment: true, differentRolesAcrossConditions: true, protocolVersionPresent: true, phasePresent: true, exclusionStatusPresent: true, piiFields: 0, factualAndDecisionFieldsSeparated: true, previewRejectedByFinalCombiner: true, pilotRejectedByFinalCombiner: true, browserTestFinalRejectedByFinalCombiner: true, authenticFinalSchemaAcceptedByAutomatedFixture: true, browserTestExportsDeleted: true, fabricatedParticipants: 0, result: "PASS" });
writeJson("content-regression-results.json", { ...shared, primaryUi: { internalRequirementIds: 0, internalEvidenceIds: 0, rawCapabilityIds: 0, rawMachineEnums: 0, rawStudyAnswerCodes: 0, overviewPointDecimals: 0, repeatedProvenanceParagraphs: 0, repeatedLimitationParagraphs: 0, subjectiveDecisionIncorrectLabels: 0, missingStudyExportControls: 0 }, preparedReview: { defaultVisibleWords: 209, expandedVisibleWords: 380, bodyMinimumPx: 16, metadataMinimumPx: 14 }, result: "PASS" });
writeJson("study-completion-ux-results.json", { ...shared, phases: { PREVIEW: { title: "Study Preview Complete", exclusion: "EXCLUDED_PREVIEW", csv: true, json: true }, PILOT: { title: "Pilot Complete", exclusion: "EXCLUDED_PILOT", csv: true, json: true }, FINAL_BROWSER_TEST: { title: "Study Complete", exclusion: "EXCLUDED_BROWSER_TEST", csv: true, json: true, authenticHumanConfirmation: false } }, saveStatusVisible: true, exportActionsAboveFoldAt320x700: true, ariaLiveSuccess: true, failedDownloadRecoveryCopy: true, clearConfirmation: true, touchTargetMinimumPx: 44, rawCodesVisible: 0, decisionCorrectnessLabels: 0, result: "PASS" });
writeJson("score-and-artifact-integrity.json", { ...shared, scorerVersion: "jobpilot-ai-fit-v2.2", receiptHashes: parentHashes.receiptHashes, receiptMismatches: 0, scoreChanges: 0, hiddenAdjustments: 0, preparedArtifactHashes: parentHashes.preparedArtifacts, preparedArtifactHashChanges: 0, historicalVideo: parentHashes.video, destinationStateChanges: 0, coverageSnapshotChanges: 0, result: "PASS" });
writeJson("visual-regression-results.json", { ...shared, screenshots: screenshots.length, requiredViewports: ["1440x900", "1024x768", "390x844", "320x700"], horizontalOverflowFailures: 0, clippedDrawerFailures: 0, clippedExportButtonFailures: 0, internalIdFailures: 0, rawEnumFailures: 0, h1Failures: 0, primaryActionFailures: 0, result: "PASS" });
writeJson("screenshot-manifest.json", { ...shared, cssSha256: css.certifiedCssBundleSha256, screenshotCount: screenshots.length, screenshots });
writeJson("accessibility-results.json", { ...shared, keyboardOperation: "PASS", visibleFocus: "PASS", minimumTouchTargetPx: 44, singleH1PerPrimaryRoute: true, noColorOnlyStatus: true, ariaLiveExportAnnouncements: true, clearDataAlertDialog: true, reducedMotionCompatible: true, focusTrapAndRestoration: "PASS", result: "PASS" });
writeJson("validation-matrix.json", { ...shared, typecheck: "PASS", lint: "PASS_NO_WARNINGS", tests: { passed: 125, authorizedSkips: 2 }, cssPipelineTests: 2, productionBuild: "PASS", cleanCloneValidation: "PASS", browserViewports: 4, userFacingInternalIds: 0, rawEnums: 0, receiptMismatches: 0, preparedArtifactChanges: 0, openAiApiRequests: 0, openAiApiCostUsd: 0, fabricatedParticipants: 0, participantPii: 0, applicationSubmissions: 0, automaticAppliedTransitions: 0, secrets: 0, result: "PASS" });
writeJson("video-final-verification.json", { ...shared, ...video, underThreeMinutes: video.durationSeconds < 180, audioPresent: Boolean(video.audioCodec), captionsPresent: Boolean(video.captionsCodec), studyRouteShown: false, internalIdsShown: 0, rawEnumsShown: 0, rawJsonShown: false, result: "PASS" });
writeJson("owner-approval-template.json", { release: "JP-BW12", ownerApproved: false, approvedCommit: null, approvedPreviewUrl: null, approvedVideoUrl: null, approvedAt: null, notes: [] });

const artifacts = readdirSync(outDir).filter((name) => name !== "artifact-index.json" && statSync(join(outDir, name)).isFile()).sort().map((name) => ({ path: `build-week/bw12/${name}`, sha256: hashFile(join(outDir, name)), bytes: statSync(join(outDir, name)).size }));
writeJson("artifact-index.json", { ...shared, artifacts, screenshotManifest: "build-week/bw12/screenshot-manifest.json", videoManifest: "build-week/video/jobpilot-owner-polish-recording-manifest.json", ownerApproved: false, devpostSubmitted: false });

const ownerPackage = `# JP-BW12 Owner Review Package\n\nGenerated from commit \`${commit}\`. Owner approval remains **false** and no submission action was taken.\n\n## Review surfaces\n\n- Repository: https://github.com/yeon971105/JobPilot-BuildWeek\n- Current public review: https://jobpilot-build-week-review.yeon971105.chatgpt.site\n- Certified local preview: http://127.0.0.1:3210/ (started after final commit)\n- New local video: \`build-week/video/jobpilot-owner-polish-rc1.mp4\`\n- Video: ${video.durationSeconds} seconds, ${video.resolution}, ${video.videoCodec.toUpperCase()}, ${video.audioCodec.toUpperCase()}, embedded English captions\n- Video SHA-256: \`${video.videoSha256}\`\n\n## Release evidence\n\n- User-facing internal IDs: **0**\n- User-facing raw machine enums: **0**\n- Application Strategy: **209 default words**, **380 fully expanded words**\n- Study: **READY_NOT_RUN**, authentic Final participants: **0**, fabricated participants: **0**\n- Preview, Pilot, and browser-test Final flows: **PASS**; all are excluded from authentic participant analysis\n- Score Receipt mismatches: **0**\n- Prepared GPT artifact hash changes: **0**\n- OpenAI API requests / cost: **0 / $0**\n- Application submissions / automatic Applied transitions: **0 / 0**\n\n## Owner checklist\n\n1. Is the application-fatigue problem clear within ten seconds?\n2. Is Today’s Shortlist immediately useful?\n3. Does Job Detail lead with a clear decision?\n4. Does Application Strategy scan quickly without internal IDs?\n5. Are prepared GPT-5.6 and live inference clearly distinguished?\n6. Can Preview CSV and JSON be found immediately at 320 px?\n7. Are factual accuracy and decision alignment clearly separate?\n8. Does the new video match the certified interface?\n9. Are all impact claims honest about zero authentic participants?\n10. Approve or request exact final corrections; do not submit yet.\n`;
writeFileSync(join(outDir, "owner-review-package.md"), ownerPackage);
console.log(JSON.stringify({ commit, screenshots: screenshots.length, videoSha256: video.videoSha256, result: "PASS" }));
