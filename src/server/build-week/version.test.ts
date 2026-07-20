import { describe, expect, it } from "vitest";
import { getBuildVersion } from "@/server/build-week/version";

const sourceCommit = "173bf67db276e4639c5a57b6c4a02070222ca8ba";

describe("immutable public build metadata", () => {
  it("returns the public-safe contract from deployment-time metadata", () => {
    expect(getBuildVersion({
      JOBPILOT_BUILD_COMMIT: sourceCommit,
      JOBPILOT_RELEASE_TAG: "build-week-2026-study-evidence-rc1",
      JOBPILOT_DEPLOYED_AT: "2026-07-20T18:00:00.000Z",
      JOBPILOT_DEPLOYMENT_ENVIRONMENT: "public-review",
    })).toEqual({
      product: "JobPilot",
      commit: sourceCommit,
      shortCommit: "173bf67",
      releaseTag: "build-week-2026-study-evidence-rc1",
      buildId: sourceCommit,
      deployedAt: "2026-07-20T18:00:00.000Z",
      environment: "public-review",
    });
  });

  it("fails closed when build metadata is missing or invalid", () => {
    expect(() => getBuildVersion({})).toThrow("JOBPILOT_BUILD_COMMIT");
    expect(() => getBuildVersion({
      JOBPILOT_BUILD_COMMIT: "not-a-commit",
      JOBPILOT_RELEASE_TAG: "tag",
      JOBPILOT_DEPLOYED_AT: "not-a-date",
      JOBPILOT_DEPLOYMENT_ENVIRONMENT: "public-review",
    })).toThrow("full Git SHA-1");
  });
});
