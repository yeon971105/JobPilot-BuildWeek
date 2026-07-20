import type { NextConfig } from "next";

const immutableMetadataNames = [
  "JOBPILOT_BUILD_COMMIT",
  "JOBPILOT_RELEASE_TAG",
  "JOBPILOT_DEPLOYED_AT",
  "JOBPILOT_DEPLOYMENT_ENVIRONMENT",
] as const;

function immutableBuildMetadata() {
  const metadata = Object.fromEntries(immutableMetadataNames.map((name) => [name, process.env[name]?.trim()])) as Record<(typeof immutableMetadataNames)[number], string | undefined>;
  const missing = immutableMetadataNames.filter((name) => !metadata[name]);
  if (missing.length > 0) throw new Error(`Production build is missing immutable JobPilot metadata: ${missing.join(", ")}`);
  if (!/^[0-9a-f]{40}$/.test(metadata.JOBPILOT_BUILD_COMMIT!)) throw new Error("JOBPILOT_BUILD_COMMIT must be a full Git SHA-1 commit.");
  if (metadata.JOBPILOT_DEPLOYMENT_ENVIRONMENT !== "public-review") throw new Error("JOBPILOT_DEPLOYMENT_ENVIRONMENT must be public-review.");
  if (Number.isNaN(Date.parse(metadata.JOBPILOT_DEPLOYED_AT!))) throw new Error("JOBPILOT_DEPLOYED_AT must be an ISO-8601 timestamp.");
  return metadata as Record<(typeof immutableMetadataNames)[number], string>;
}

const buildMetadata = immutableBuildMetadata();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: process.env.JOBPILOT_SITES_STANDALONE === "true" ? "standalone" : undefined,
  logging: process.env.JOBPILOT_SITES_STANDALONE === "true" ? { browserToTerminal: false } : undefined,
  env: buildMetadata,
  generateBuildId: async () => buildMetadata.JOBPILOT_BUILD_COMMIT,
};

export default nextConfig;
