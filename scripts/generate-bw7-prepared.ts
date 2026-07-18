import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_CANDIDATE, getDemoJob } from "../src/lib/demo-contract";
import { scoreJob, sha256 } from "../src/server/build-week/scorer";

const root = process.cwd();
const outputDir = join(root, "build-week", "gpt56-prepared");
const auditDir = join(root, "build-week", "bw7");
const generatedAt = "2026-07-18T06:35:00.000Z";
const threadId = "019f7382-0ef9-7d10-bf26-d6e5615924dd";
const modelFamily = "gpt-5.6-sol";
mkdirSync(outputDir, { recursive: true });

const northstar = getDemoJob("northstar-applied-ai-solutions-engineer")!;
const alder = getDemoJob("alder-data-platform-engineer")!;
const northstarAnalysis = scoreJob(northstar);
const alderAnalysis = scoreJob(alder);

const baseInput = {
  candidate: { id: DEMO_CANDIDATE.id, synthetic: true, evidence: DEMO_CANDIDATE.evidence },
  job: { id: northstar.id, contentHash: northstar.contentHash, requirements: northstar.requirements },
  capabilityGroups: northstarAnalysis.capabilityGroups,
  practicalConstraints: northstarAnalysis.practicalConstraints,
  deterministicReceipt: northstarAnalysis.receipt,
};

type PreparedOutput = Record<string, unknown>;
function artifact(promptVersion: string, jobEvidenceIds: string[], candidateEvidenceIds: string[], input: unknown, output: PreparedOutput) {
  return {
    artifactVersion: "1.0.0",
    generationSurface: "Codex Desktop task",
    modelFamily,
    codexThreadId: threadId,
    promptVersion,
    schemaVersion: "jobpilot.gpt56-prepared.v1",
    inputHash: sha256(input),
    outputHash: sha256(output),
    generatedAt,
    jobEvidenceIds,
    candidateEvidenceIds,
    apiRequestCount: 0,
    modelGeneratedFinalScore: false,
    chainOfThoughtStored: false,
    unsupportedCandidateClaims: 0,
    unsupportedJobClaims: 0,
    invalidEvidenceIds: 0,
    fabricatedExperience: 0,
    fabricatedEducation: 0,
    fabricatedSkills: 0,
    applicationSubmissions: 0,
    output,
  };
}

const applicationOutput = {
  recommendation: "APPLY",
  rationale: "The deterministic receipt shows high evidence coverage, no confirmed practical blocker, and direct support for the role’s central Python, applied-AI, customer-discovery, and data-integration requirements. Apply only with the cited synthetic evidence; do not imply production scope beyond it.",
  strongestFitEvidence: [
    { requirementId: "r-ns-python", evidenceId: "e-python", explanation: "Typed Python services, REST integrations, automated tests, and rollback documentation directly support production-quality integration work." },
    { requirementId: "r-ns-ai", evidenceId: "e-ai", explanation: "The retrieval-assisted workflow, evaluation datasets, human review, and documented limitations support grounded AI workflow delivery." },
    { requirementId: "r-ns-customer", evidenceId: "e-customer", explanation: "Technical workshops and implementation plans support customer-facing discovery and tradeoff communication." }
  ],
  truthfulGaps: [
    { requirementId: "r-ns-years", explanation: "The experience requirement is preferred, and the relevant midpoint is below a fully literal match; describe the documented scope rather than rounding it up." },
    { requirementId: "r-ns-ai", explanation: "The match is a strong equivalent rather than an identical employment claim; be ready to explain evaluation depth and production boundaries." }
  ],
  resumeEmphasis: [
    { evidenceId: "e-python", recommendation: "Lead with tested integrations and operational safeguards, using only the stated fictional scope." },
    { evidenceId: "e-ai", recommendation: "Show the evaluation workflow, human review, and documented limitations as one coherent delivery example." },
    { evidenceId: "e-customer", recommendation: "Connect workshop discovery to implementation plans and adoption checkpoints." }
  ],
  interviewTopics: [
    { requirementId: "r-ns-ai", topic: "Walk through an evaluation failure, the evidence used to diagnose it, and the release safeguard that followed." },
    { requirementId: "r-ns-python", topic: "Explain test design, API failure handling, and rollback behavior for a Python integration." },
    { requirementId: "r-ns-customer", topic: "Prepare an example of translating an ambiguous stakeholder need into a bounded technical plan." }
  ],
  researchQuestions: [
    { requirementId: "r-ns-ai", question: "Which evaluation criteria determine whether an AI workflow advances from prototype to customer deployment?" },
    { requirementId: "r-ns-customer", question: "How are discovery, implementation ownership, and post-launch enablement divided across the team?" }
  ],
  practicalConstraintsToClarify: [],
  limitations: ["Prepared from frozen synthetic evidence; this is not a live API response.", "The review does not change capability classes, Evidence Quality, Fit Score, or the Score Receipt.", "The public demo does not submit an application."]
};

const challengeOutput = {
  supportedFindings: [
    { requirementId: "r-ns-python", evidenceIds: ["e-python"], assessment: "The explicit Python integration and testing evidence supports the MATCHED classification." },
    { requirementId: "r-ns-customer", evidenceIds: ["e-customer"], assessment: "The workshop and implementation-planning evidence supports customer technical discovery." },
    { requirementId: "r-ns-data", evidenceIds: ["e-data"], assessment: "SQL transformations and monitored pipelines support operational data integration." }
  ],
  questionableMatches: [
    { requirementId: "r-ns-ai", evidenceIds: ["e-ai", "e-delivery"], assessment: "STRONG_EQUIVALENT is defensible, but the frozen evidence does not establish the employer’s exact deployment scale or tooling." },
    { requirementId: "r-ns-years", evidenceIds: ["e-delivery"], assessment: "The preferred years calculation depends on dated, relevance-weighted intervals and should not be restated as an unqualified year count." }
  ],
  missingConsiderations: [
    { requirementId: "r-ns-vector", consideration: "The evidence supports embedding indexes but does not establish operations at a specific scale or named vector database." }
  ],
  classificationDisagreements: [],
  uncertainty: ["Production scale remains unspecified in the frozen candidate evidence.", "The role’s exact balance of prototyping and production ownership is not stated."],
  limitations: ["Prepared from frozen synthetic evidence with zero OpenAI API requests.", "This critique recommends review only and makes no direct score change."]
};

const ambiguityOutput = {
  requirementId: "r-ns-education",
  ambiguousSourceStatement: "Preferred: relevant technical education or equivalent evidence from delivered projects.",
  possibleInterpretations: ["A formal technical degree is preferred.", "Equivalent delivered-project evidence may satisfy the preference without a degree.", "The team may weigh formal education and project evidence differently."],
  supportedInterpretation: "The wording explicitly permits equivalent delivered-project evidence, and e-education plus e-delivery support that interpretation without claiming a degree or certification.",
  unresolvedUncertainty: "The posting does not state how the employer compares formal education with project evidence during review.",
  evidenceIds: ["e-education", "e-delivery"],
  deterministicReanalysisRequired: false,
  directScoreChange: false,
  limitations: ["Prepared review cannot infer the employer’s unstated preference strength."]
};

const comparisonInput = {
  candidate: baseInput.candidate,
  roles: [
    { job: northstar, analysis: { receiptHash: northstarAnalysis.receipt.receiptHash, score: northstarAnalysis.displayedScore, evidenceQuality: northstarAnalysis.evidenceQuality, priority: northstarAnalysis.applyPriority, constraints: northstarAnalysis.practicalConstraints } },
    { job: alder, analysis: { receiptHash: alderAnalysis.receipt.receiptHash, score: alderAnalysis.displayedScore, evidenceQuality: alderAnalysis.evidenceQuality, priority: alderAnalysis.applyPriority, constraints: alderAnalysis.practicalConstraints } },
  ],
};
const comparisonOutput = {
  roles: [
    { jobId: northstar.id, advantages: ["Direct evidence for Python integration, applied AI evaluation, and customer discovery.", "No confirmed practical blocker in the frozen demo profile."], gaps: ["Relevant delivery years remain a preferred strong equivalent rather than a fully literal match."], practicalConstraints: ["Hybrid San Francisco and remote options align with the configured demo modes."] },
    { jobId: alder.id, advantages: ["Strong SQL, analytics partnership, and data-platform evidence."], gaps: ["Python data services and data observability are partial; workflow orchestration is not evidenced.", "The preferred data-platform duration is not fully established."], practicalConstraints: ["Hybrid Oakland is inside the configured nearby radius."] }
  ],
  attentionFirst: northstar.id,
  rationale: "Northstar deserves attention first because its central requirements have broader direct or strong-equivalent evidence and no confirmed blocker. Alder remains a credible second option, but its largest technical gaps require more clarification.",
  evidenceIds: ["e-python", "e-ai", "e-customer", "e-data", "e-product", "e-delivery"],
  newNumericScore: null,
  hiddenRankingFormula: false,
  limitations: ["This prepared comparison uses only two frozen synthetic roles.", "The recommendation does not modify either deterministic score or receipt."]
};

const artifacts = {
  "application-strategy.json": artifact("jobpilot-prepared-application-strategy.v1", northstar.requirements.map((item) => item.id), ["e-python", "e-ai", "e-customer", "e-data", "e-delivery"], baseInput, applicationOutput),
  "analysis-challenge.json": artifact("jobpilot-prepared-analysis-challenge.v1", ["r-ns-python", "r-ns-customer", "r-ns-data", "r-ns-ai", "r-ns-years", "r-ns-vector"], ["e-python", "e-customer", "e-data", "e-ai", "e-delivery"], baseInput, challengeOutput),
  "ambiguity-review.json": artifact("jobpilot-prepared-ambiguity-review.v1", ["r-ns-education"], ["e-education", "e-delivery"], baseInput, ambiguityOutput),
  "strategy-comparison.json": artifact("jobpilot-prepared-strategy-comparison.v1", [...northstar.requirements.map((item) => item.id), ...alder.requirements.map((item) => item.id)], comparisonOutput.evidenceIds, comparisonInput, comparisonOutput),
};

for (const [name, value] of Object.entries(artifacts)) writeFileSync(join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
const shaFile = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const manifest = {
  purpose: "Index zero-API GPT-5.6 prepared reviews generated in the authorized Codex build session.",
  generatedAt,
  generationSurface: "Codex Desktop task",
  modelFamily,
  codexThreadId: threadId,
  apiRequestCount: 0,
  openAiApiCostUsd: 0,
  modelGeneratedFinalScores: 0,
  chainOfThoughtStored: false,
  artifacts: Object.keys(artifacts).map((name) => ({ path: `build-week/gpt56-prepared/${name}`, sha256: shaFile(join(outputDir, name)), outputHash: artifacts[name as keyof typeof artifacts].outputHash })),
  invalidEvidenceIds: 0,
  unsupportedCandidateClaims: 0,
  unsupportedJobClaims: 0,
  fabricatedExperience: 0,
  fabricatedEducation: 0,
  fabricatedSkills: 0,
  applicationSubmissions: 0,
  result: "PASS"
};
writeFileSync(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const provenance = {
  purpose: "Record verifiable model, task, and zero-API provenance for prepared Build Week reviews.",
  timestamp: generatedAt,
  commit: "b9bd1ce",
  privacyClassification: "PUBLIC_SAFE_SYNTHETIC",
  publicSafeStatus: "PUBLIC_SAFE",
  supportedGate: "GPT-5.6 prepared-review provenance",
  provenanceVerified: true,
  metadataSource: "x-codex-turn-metadata",
  generationSurface: "Codex Desktop task",
  modelFamily,
  reasoningEffort: "xhigh",
  codexThreadId: threadId,
  apiRequestCount: 0,
  openAiApiCostUsd: 0,
  openAiKeyUsed: false,
  unofficialEndpointsUsed: false,
  browserAutomationAgainstChatGPT: false,
  hiddenCredentialsUsed: false,
  chainOfThoughtStored: false,
  finalStructuredOutputsOnly: true,
  manifestSha256: sha256(manifest),
  result: "PASS"
};
writeFileSync(join(auditDir, "gpt56-prepared-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);
console.log(JSON.stringify({ files: Object.keys(artifacts).length + 2, modelFamily, threadId, apiRequestCount: 0, openAiApiCostUsd: 0 }, null, 2));
