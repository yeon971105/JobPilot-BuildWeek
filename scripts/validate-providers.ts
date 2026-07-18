import { getPublicProviderStatus, routeHybridTask } from "../src/server/build-week/providers";
import { parseRuntimeEnvironment } from "../src/server/build-week/env";

const noKey = parseRuntimeEnvironment({
  AI_RUNTIME_MODE: "LOCAL_FIRST", OLLAMA_BASE_URL: "http://127.0.0.1:11434", OLLAMA_MODEL: "gemma4:12b", OLLAMA_ENABLED: "true",
  OPENAI_HEAVY_FEATURES_ENABLED: "false", OPENAI_HEAVY_MODEL: "gpt-5.6-terra", OPENAI_API_KEY: "",
  BUILD_WEEK_DEMO_MODE: "true", BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true", BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: "false", BUILD_WEEK_ALLOW_LIVE_GPT56: "false",
});
const semantic = routeHybridTask("JOB_SEMANTIC_ANALYSIS", noKey);
const heavy = routeHybridTask("APPLICATION_STRATEGY", noKey);
if (semantic.provider !== "LOCAL_GEMMA_PREPARED" || heavy.provider !== "FIXTURE_ONLY") throw new Error("No-key provider routing failed closed incorrectly.");
console.log(JSON.stringify({ validation: "PASS", architecture: "LOCAL_FIRST_HYBRID", deterministic: "jobpilot-ai-fit-v2.2", semantic, heavy, publicStatus: getPublicProviderStatus(), openAiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()), secretsPrinted: false }, null, 2));
