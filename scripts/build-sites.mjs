import { spawnSync } from "node:child_process";
import path from "node:path";

const workspace = process.cwd();
const nextCli = path.join(workspace, "node_modules", "next", "dist", "bin", "next");
const deploymentCommit = process.env.JOBPILOT_DEPLOYMENT_COMMIT?.trim() || spawnSync("git", ["rev-parse", "HEAD"], { cwd: workspace, encoding: "utf8" }).stdout.trim();
const immutableMetadata = {
  JOBPILOT_APPROVED_PRODUCT_COMMIT: process.env.JOBPILOT_APPROVED_PRODUCT_COMMIT?.trim(),
  JOBPILOT_DEPLOYMENT_COMMIT: deploymentCommit,
  JOBPILOT_RELEASE_TAG: process.env.JOBPILOT_RELEASE_TAG?.trim(),
  JOBPILOT_DEPLOYMENT_ENVIRONMENT: process.env.JOBPILOT_DEPLOYMENT_ENVIRONMENT?.trim(),
  JOBPILOT_DEPLOYED_AT: process.env.JOBPILOT_DEPLOYED_AT?.trim() || new Date().toISOString(),
};
const missing = Object.entries(immutableMetadata).filter(([, value]) => !value).map(([name]) => name);
if (missing.length > 0) throw new Error(`Production build is missing immutable JobPilot metadata: ${missing.join(", ")}`);
const build = spawnSync(process.execPath, [nextCli, "build", "--webpack"], {
  cwd: workspace,
  env: { ...process.env, ...immutableMetadata, JOBPILOT_SITES_STANDALONE: "true" },
  stdio: "inherit",
});

if (build.status !== 0) process.exit(build.status ?? 1);
const adapterCommand = process.platform === "win32" ? "opennextjs-cloudflare.cmd" : "opennextjs-cloudflare";
const adapter = spawnSync(adapterCommand, ["build", "--skipNextBuild"], {
  cwd: workspace,
  shell: process.platform === "win32",
  stdio: "inherit",
});
if (adapter.status !== 0) process.exit(adapter.status ?? 1);
await import("./package-sites-output.mjs");
