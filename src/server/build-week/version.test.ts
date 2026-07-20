import { describe, expect, it } from "vitest";
import { getBuildVersion } from "@/server/build-week/version";

const sourceCommit = "173bf67db276e4639c5a57b6c4a02070222ca8ba";

describe("immutable public build metadata", () => {
  it("returns the public-safe contract from deployment-time metadata", () => {
    expect(getBuildVersion({
      JOBPILOT_APPROVED_PRODUCT_COMMIT: sourceCommit,
      JOBPILOT_DEPLOYMENT_COMMIT: "0677d983722b93341eeb0144998ed2b7ea185403",
      JOBPILOT_RELEASE_TAG: "build-week-2026-study-evidence-rc1",
      JOBPILOT_DEPLOYED_AT: "2026-07-20T18:00:00.000Z",
      JOBPILOT_DEPLOYMENT_ENVIRONMENT: "public-review",
    })).toEqual({
      product: "JobPilot",
      productCommit: sourceCommit,
      productShortCommit: "173bf67",
      deploymentCommit: "0677d983722b93341eeb0144998ed2b7ea185403",
      deploymentShortCommit: "0677d98",
      releaseTag: "build-week-2026-study-evidence-rc1",
      buildId: "0677d983722b93341eeb0144998ed2b7ea185403",
      deployedAt: "2026-07-20T18:00:00.000Z",
      environment: "public-review",
    });
  });

  it("fails closed when build metadata is missing or invalid", () => {
    expect(() => getBuildVersion({})).toThrow("JOBPILOT_APPROVED_PRODUCT_COMMIT");
    expect(() => getBuildVersion({
      JOBPILOT_APPROVED_PRODUCT_COMMIT: "not-a-commit",
      JOBPILOT_DEPLOYMENT_COMMIT: "0677d983722b93341eeb0144998ed2b7ea185403",
      JOBPILOT_RELEASE_TAG: "tag",
      JOBPILOT_DEPLOYED_AT: "not-a-date",
      JOBPILOT_DEPLOYMENT_ENVIRONMENT: "public-review",
    })).toThrow("JOBPILOT_APPROVED_PRODUCT_COMMIT");
  });
});
