export type BuildVersion = {
  product: "JobPilot";
  commit: string;
  shortCommit: string;
  releaseTag: string;
  buildId: string;
  deployedAt: string;
  environment: "public-review";
};

type VersionEnvironment = Record<string, string | undefined>;
type RequiredMetadataName = "JOBPILOT_BUILD_COMMIT" | "JOBPILOT_RELEASE_TAG" | "JOBPILOT_DEPLOYED_AT" | "JOBPILOT_DEPLOYMENT_ENVIRONMENT";

const deploymentEnvironment: VersionEnvironment = {
  JOBPILOT_BUILD_COMMIT: process.env.JOBPILOT_BUILD_COMMIT,
  JOBPILOT_RELEASE_TAG: process.env.JOBPILOT_RELEASE_TAG,
  JOBPILOT_DEPLOYED_AT: process.env.JOBPILOT_DEPLOYED_AT,
  JOBPILOT_DEPLOYMENT_ENVIRONMENT: process.env.JOBPILOT_DEPLOYMENT_ENVIRONMENT,
};

function value(name: RequiredMetadataName, env: VersionEnvironment) {
  const result = env[name]?.trim();
  if (!result) throw new Error(`Missing required immutable build metadata: ${name}`);
  return result;
}

export function getBuildVersion(env: VersionEnvironment = deploymentEnvironment): BuildVersion {
  const commit = value("JOBPILOT_BUILD_COMMIT", env);
  const releaseTag = value("JOBPILOT_RELEASE_TAG", env);
  const deployedAt = value("JOBPILOT_DEPLOYED_AT", env);
  const environment = value("JOBPILOT_DEPLOYMENT_ENVIRONMENT", env);

  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error("JOBPILOT_BUILD_COMMIT must be a full Git SHA-1 commit.");
  if (Number.isNaN(Date.parse(deployedAt))) throw new Error("JOBPILOT_DEPLOYED_AT must be an ISO-8601 timestamp.");
  if (environment !== "public-review") throw new Error("JOBPILOT_DEPLOYMENT_ENVIRONMENT must be public-review.");

  return {
    product: "JobPilot",
    commit,
    shortCommit: commit.slice(0, 7),
    releaseTag,
    buildId: commit,
    deployedAt,
    environment,
  };
}
