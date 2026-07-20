export type BuildVersion = {
  product: "JobPilot";
  productCommit: string;
  productShortCommit: string;
  deploymentCommit: string;
  deploymentShortCommit: string;
  releaseTag: string;
  buildId: string;
  deployedAt: string;
  environment: "public-review";
};

type VersionEnvironment = Record<string, string | undefined>;
type RequiredMetadataName = "JOBPILOT_APPROVED_PRODUCT_COMMIT" | "JOBPILOT_DEPLOYMENT_COMMIT" | "JOBPILOT_RELEASE_TAG" | "JOBPILOT_DEPLOYED_AT" | "JOBPILOT_DEPLOYMENT_ENVIRONMENT";

const deploymentEnvironment: VersionEnvironment = {
  JOBPILOT_APPROVED_PRODUCT_COMMIT: process.env.JOBPILOT_APPROVED_PRODUCT_COMMIT,
  JOBPILOT_DEPLOYMENT_COMMIT: process.env.JOBPILOT_DEPLOYMENT_COMMIT,
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
  const productCommit = value("JOBPILOT_APPROVED_PRODUCT_COMMIT", env);
  const deploymentCommit = value("JOBPILOT_DEPLOYMENT_COMMIT", env);
  const releaseTag = value("JOBPILOT_RELEASE_TAG", env);
  const deployedAt = value("JOBPILOT_DEPLOYED_AT", env);
  const environment = value("JOBPILOT_DEPLOYMENT_ENVIRONMENT", env);

  if (!/^[0-9a-f]{40}$/.test(productCommit)) throw new Error("JOBPILOT_APPROVED_PRODUCT_COMMIT must be a full Git SHA-1 commit.");
  if (!/^[0-9a-f]{40}$/.test(deploymentCommit)) throw new Error("JOBPILOT_DEPLOYMENT_COMMIT must be a full Git SHA-1 commit.");
  if (Number.isNaN(Date.parse(deployedAt))) throw new Error("JOBPILOT_DEPLOYED_AT must be an ISO-8601 timestamp.");
  if (environment !== "public-review") throw new Error("JOBPILOT_DEPLOYMENT_ENVIRONMENT must be public-review.");

  return {
    product: "JobPilot",
    productCommit,
    productShortCommit: productCommit.slice(0, 7),
    deploymentCommit,
    deploymentShortCommit: deploymentCommit.slice(0, 7),
    releaseTag,
    buildId: deploymentCommit,
    deployedAt,
    environment,
  };
}
