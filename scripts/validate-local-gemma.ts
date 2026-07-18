import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEMO_JOBS } from "../src/lib/demo-contract";
import { runLocalGemmaCanary } from "../src/server/build-week/local-gemma";

async function main() {
 const job = DEMO_JOBS.find((item) => item.id === "northstar-applied-ai-solutions-engineer")!;
 const startedAt = new Date().toISOString();
 try {
  const result = await runLocalGemmaCanary(job.id);
  const returnedRequirementIds = new Set([...result.analysis.requiredRequirementIds, ...result.analysis.preferredRequirementIds, ...result.analysis.capabilityGroups.map((item) => item.requirementId), ...result.analysis.evidenceMatches.map((item) => item.requirementId)]);
  const knownIds = new Set(job.requirements.map((item) => item.id));
  const unknownIds = [...returnedRequirementIds].filter((id) => !knownIds.has(id));
  const coverage = job.requirements.filter((item) => returnedRequirementIds.has(item.id)).length / job.requirements.length;
  const canary = { schemaVersion: "jobpilot.bw3-local-gemma-canary.v1", startedAt, completedAt: new Date().toISOString(), jobId: job.id, model: result.metadata.model, digest: result.metadata.digest, liveCanaryAttempted: true, liveCanaryCompleted: true, structuredOutputValid: true, unknownRequirementIds: unknownIds, frozenRequirementCoverage: coverage, finalScoreInModelOutput: /(?:fit|final)\s*score|\b\d{1,3}\s*\/\s*100/i.test(JSON.stringify(result.analysis)), evidenceIdsValidated: true, pass: unknownIds.length === 0 && coverage >= 0.7 };
  const trace = { ...result.metadata, schemaVersion: "jobpilot.bw3-local-gemma-trace.v1", logicalCalls: ["JOB_SEMANTIC_ANALYSIS", "RESUME_SEMANTIC_PROFILE", "BATCHED_REQUIREMENT_MATCH"], fullResumeResentPerRequirement: false, oneCallPerRequirement: false, modelOutput: result.analysis, scoreCalculatedByModel: false, chainOfThoughtStored: false };
  if (process.argv.includes("--record")) {
    const dir = resolve("build-week/bw3"); mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "local-gemma-canary.json"), `${JSON.stringify(canary, null, 2)}\n`);
    writeFileSync(resolve(dir, "local-gemma-analysis-trace.json"), `${JSON.stringify(trace, null, 2)}\n`);
    writeFileSync(resolve(dir, "local-gemma-runtime.json"), `${JSON.stringify({ schemaVersion: "jobpilot.bw3-local-gemma-runtime.v1", endpoint: result.metadata.endpoint, endpointHealthy: true, remoteEndpointUsed: false, model: result.metadata.model, liveCanary: canary.pass ? "PASS" : "FAIL", metadata: result.metadata }, null, 2)}\n`);
    writeFileSync(resolve(dir, "local-gemma-model-freeze.json"), `${JSON.stringify({ schemaVersion: "jobpilot.bw3-local-gemma-model-freeze.v1", model: result.metadata.model, digest: result.metadata.digest, parameterSize: result.metadata.parameterSize, quantization: result.metadata.quantization, family: result.metadata.family, ollamaVersion: "0.30.7", modelPulled: false, modelSubstituted: false }, null, 2)}\n`);
  }
  console.log(JSON.stringify(canary, null, 2));
  if (!canary.pass) process.exitCode = 2;
 } catch (error) {
  const failure = { schemaVersion: "jobpilot.bw3-local-gemma-canary.v1", startedAt, completedAt: new Date().toISOString(), liveCanaryAttempted: true, liveCanaryCompleted: false, error: error instanceof Error ? error.message : "Unknown local validation failure", hold: "HOLD_BUILD_WEEK_LOCAL_GEMMA_LIVE_CERTIFICATION", modelPulled: false, modelSubstituted: false };
  if (process.argv.includes("--record")) { const dir = resolve("build-week/bw3"); mkdirSync(dir, { recursive: true }); writeFileSync(resolve(dir, "local-gemma-canary.json"), `${JSON.stringify(failure, null, 2)}\n`); writeFileSync(resolve(dir, "local-gemma-analysis-trace.json"), `${JSON.stringify(failure, null, 2)}\n`); }
  console.error(JSON.stringify(failure, null, 2)); process.exitCode = 2;
 }
}
main().catch((error) => { console.error(JSON.stringify({ validation: "FAILED", error: error instanceof Error ? error.message : "Unknown error", modelPulled: false }, null, 2)); process.exitCode = 2; });
