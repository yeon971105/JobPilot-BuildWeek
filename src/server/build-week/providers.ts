import { parseRuntimeEnvironment, type RuntimeEnvironment } from "@/server/build-week/env";

export type DemoProviderMode = "LOCAL_GEMMA_LIVE" | "LOCAL_GEMMA_PREPARED" | "OPENAI_GPT56_HEAVY" | "FIXTURE_ONLY";
export type HybridTask = "DETERMINISTIC_EXTRACTION" | "JOB_SEMANTIC_ANALYSIS" | "RESUME_SEMANTIC_PROFILE" | "BATCHED_REQUIREMENT_MATCH" | "APPLICATION_STRATEGY" | "CHALLENGE_ANALYSIS" | "RESOLVE_AMBIGUITY" | "COMPARE_STRATEGIES";

export function openAiHeavyEnabled(config: RuntimeEnvironment) {
  const requested = config.OPENAI_HEAVY_FEATURES_ENABLED || config.BUILD_WEEK_ALLOW_LIVE_GPT56;
  return requested && Boolean(config.OPENAI_API_KEY?.trim());
}

export function routeHybridTask(task: HybridTask, config = parseRuntimeEnvironment()) {
  if (task === "DETERMINISTIC_EXTRACTION") return { provider: "DETERMINISTIC_CODE" as const, live: true };
  if (["APPLICATION_STRATEGY", "CHALLENGE_ANALYSIS", "RESOLVE_AMBIGUITY", "COMPARE_STRATEGIES"].includes(task)) {
    return openAiHeavyEnabled(config)
      ? { provider: "OPENAI_GPT56_HEAVY" as const, model: config.OPENAI_HEAVY_MODEL, live: true }
      : { provider: "FIXTURE_ONLY" as const, model: "prepared-demonstration-output", live: false };
  }
  if (config.OLLAMA_ENABLED && config.BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS) return { provider: "LOCAL_GEMMA_LIVE" as const, model: config.OLLAMA_MODEL, live: true };
  if (config.BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES) return { provider: "LOCAL_GEMMA_PREPARED" as const, model: config.OLLAMA_MODEL, live: false };
  return { provider: "FIXTURE_ONLY" as const, model: "deterministic-demo-fixture", live: false };
}

export function getDemoProviderConfig(env: Record<string, string | undefined> = process.env) {
  const config = parseRuntimeEnvironment(env);
  const heavy = routeHybridTask("APPLICATION_STRATEGY", config);
  return { mode: heavy.provider as DemoProviderMode, model: heavy.model, live: heavy.live, responsesApi: heavy.provider === "OPENAI_GPT56_HEAVY", structuredOutputs: heavy.provider === "OPENAI_GPT56_HEAVY" };
}

export function getPublicProviderStatus(env: Record<string, string | undefined> = process.env) {
  const config = parseRuntimeEnvironment(env);
  const heavy = routeHybridTask("APPLICATION_STRATEGY", config);
  return {
    applicationStatus: "ok",
    demoDataStatus: config.BUILD_WEEK_DEMO_MODE ? "synthetic-ready" : "disabled",
    cachedGemmaStatus: config.BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES ? "ready" : "disabled",
    deterministicScorerStatus: "jobpilot-ai-fit-v2.2-ready",
    openAiHeavyFeatures: heavy.provider === "OPENAI_GPT56_HEAVY" ? "enabled" : "disabled",
  };
}
