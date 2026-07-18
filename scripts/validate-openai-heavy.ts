import { buildLiveApplicationStrategy } from "../src/server/build-week/strategy";

async function main() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error(JSON.stringify({ validation: "CONFIGURATION_REQUIRED", code: 78, model: "gpt-5.6-sol", keyConfigured: false, keyPrinted: false, clearance: "Set OPENAI_API_KEY server-side and enable OPENAI_HEAVY_FEATURES_ENABLED=true." }, null, 2));
    process.exitCode = 78;
  } else if (process.env.OPENAI_HEAVY_FEATURES_ENABLED !== "true" && process.env.BUILD_WEEK_ALLOW_LIVE_GPT56 !== "true") {
    console.error(JSON.stringify({ validation: "CONFIGURATION_REQUIRED", code: 78, keyConfigured: true, heavyFeatureEnabled: false, keyPrinted: false }, null, 2));
    process.exitCode = 78;
  } else {
    const strategy = await buildLiveApplicationStrategy("northstar-applied-ai-solutions-engineer");
    console.log(JSON.stringify({ validation: "PASS", model: "gpt-5.6-sol", syntheticDataOnly: true, recommendation: strategy.recommendation, keyPrinted: false }, null, 2));
  }
}
main().catch((error) => { console.error(JSON.stringify({ validation: "FAILED", error: error instanceof Error ? error.message : "Unknown error", keyPrinted: false }, null, 2)); process.exitCode = 1; });
