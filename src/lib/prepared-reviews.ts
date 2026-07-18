import applicationStrategy from "../../build-week/gpt56-prepared/application-strategy.json";
import analysisChallenge from "../../build-week/gpt56-prepared/analysis-challenge.json";
import ambiguityReview from "../../build-week/gpt56-prepared/ambiguity-review.json";
import strategyComparison from "../../build-week/gpt56-prepared/strategy-comparison.json";
import manifest from "../../build-week/gpt56-prepared/manifest.json";

export const PREPARED_REVIEW_BADGE = "GPT-5.6 — Prepared Review";
export const PREPARED_REVIEW_DISCLOSURE = "Generated with GPT-5.6 during Build Week from frozen synthetic evidence. This is a prepared review, not a live API response.";
export const PREPARED_APPLICATION_STRATEGY = applicationStrategy;
export const PREPARED_ANALYSIS_CHALLENGE = analysisChallenge;
export const PREPARED_AMBIGUITY_REVIEW = ambiguityReview;
export const PREPARED_STRATEGY_COMPARISON = strategyComparison;
export const PREPARED_REVIEW_MANIFEST = manifest;

type CommonPreparedArtifact = {
  artifactVersion: string;
  generationSurface: string;
  modelFamily: string;
  promptVersion: string;
  schemaVersion: string;
  inputHash: string;
  outputHash: string;
  jobEvidenceIds: string[];
  candidateEvidenceIds: string[];
  apiRequestCount: number;
  modelGeneratedFinalScore: boolean;
  chainOfThoughtStored: boolean;
  invalidEvidenceIds: number;
};

function proof(type: string, label: string, path: string, artifact: CommonPreparedArtifact) {
  const indexed = manifest.artifacts.find((item) => item.path === path);
  if (!indexed) throw new Error(`Prepared review manifest entry is missing for ${path}.`);
  return {
    type,
    label,
    path,
    generationSurface: artifact.generationSurface,
    modelFamily: artifact.modelFamily,
    provenanceStatus: "VERIFIED_FROM_CODEX_TASK_METADATA",
    promptVersion: artifact.promptVersion,
    schemaVersion: artifact.schemaVersion,
    frozenInputHash: artifact.inputHash,
    outputHash: artifact.outputHash,
    fileSha256: indexed.sha256,
    validEvidenceIds: [...artifact.jobEvidenceIds, ...artifact.candidateEvidenceIds],
    invalidEvidenceIds: artifact.invalidEvidenceIds,
    apiRequestCount: artifact.apiRequestCount,
    modelGeneratedFinalScore: artifact.modelGeneratedFinalScore,
    chainOfThoughtStored: artifact.chainOfThoughtStored,
    preparedNotLive: true,
  } as const;
}

export const PREPARED_REVIEW_PROOF = [
  proof("APPLICATION_STRATEGY", "Application strategy", "build-week/gpt56-prepared/application-strategy.json", applicationStrategy as CommonPreparedArtifact),
  proof("ANALYSIS_CHALLENGE", "Analysis challenge", "build-week/gpt56-prepared/analysis-challenge.json", analysisChallenge as CommonPreparedArtifact),
  proof("AMBIGUITY_REVIEW", "Ambiguity review", "build-week/gpt56-prepared/ambiguity-review.json", ambiguityReview as CommonPreparedArtifact),
  proof("STRATEGY_COMPARISON", "Strategy comparison", "build-week/gpt56-prepared/strategy-comparison.json", strategyComparison as CommonPreparedArtifact),
] as const;

export const PREPARED_REVIEW_PROVENANCE = {
  verified: true,
  source: "build-week/bw7/gpt56-prepared-provenance.json",
  generationSurface: manifest.generationSurface,
  modelFamily: manifest.modelFamily,
  codexThreadId: manifest.codexThreadId,
  apiRequestCount: manifest.apiRequestCount,
  openAiApiCostUsd: manifest.openAiApiCostUsd,
  modelGeneratedFinalScores: manifest.modelGeneratedFinalScores,
} as const;
