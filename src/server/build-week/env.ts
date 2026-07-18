import { z } from "zod";

const booleanString = (fallback: "true" | "false") => z.enum(["true", "false"]).default(fallback).transform((value) => value === "true");

const runtimeEnvironmentSchema = z.object({
  AI_RUNTIME_MODE: z.literal("LOCAL_FIRST").default("LOCAL_FIRST"),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434").refine((value) => {
    const url = new URL(value);
    return url.protocol === "http:" && ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  }, "Ollama must use a loopback HTTP endpoint."),
  OLLAMA_MODEL: z.literal("gemma4:12b").default("gemma4:12b"),
  OLLAMA_ENABLED: booleanString("true"),
  LOCAL_PRIVATE_MODE: booleanString("false"),
  OPENAI_HEAVY_FEATURES_ENABLED: booleanString("false"),
  OPENAI_HEAVY_MODEL: z.literal("gpt-5.6-terra").default("gpt-5.6-terra"),
  BUILD_WEEK_DEMO_MODE: booleanString("true"),
  BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: booleanString("true"),
  BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: booleanString("false"),
  BUILD_WEEK_ALLOW_LIVE_GPT56: booleanString("false"),
  OPENAI_API_KEY: z.string().optional(),
}).strict();

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

export function parseRuntimeEnvironment(env: Record<string, string | undefined> = process.env): RuntimeEnvironment {
  return runtimeEnvironmentSchema.parse({
    AI_RUNTIME_MODE: env.AI_RUNTIME_MODE,
    OLLAMA_BASE_URL: env.OLLAMA_BASE_URL,
    OLLAMA_MODEL: env.OLLAMA_MODEL,
    OLLAMA_ENABLED: env.OLLAMA_ENABLED,
    LOCAL_PRIVATE_MODE: env.LOCAL_PRIVATE_MODE,
    OPENAI_HEAVY_FEATURES_ENABLED: env.OPENAI_HEAVY_FEATURES_ENABLED,
    OPENAI_HEAVY_MODEL: env.OPENAI_HEAVY_MODEL,
    BUILD_WEEK_DEMO_MODE: env.BUILD_WEEK_DEMO_MODE,
    BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: env.BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES,
    BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: env.BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS,
    BUILD_WEEK_ALLOW_LIVE_GPT56: env.BUILD_WEEK_ALLOW_LIVE_GPT56,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
  });
}

export function getOpenAiApiKey(env: Record<string, string | undefined> = process.env) {
  const value = env.OPENAI_API_KEY?.trim();
  return value || null;
}
