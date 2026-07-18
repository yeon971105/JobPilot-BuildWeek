import { spawnSync } from "node:child_process";
import path from "node:path";

const workspace = process.cwd();
const nextCli = path.join(workspace, "node_modules", "next", "dist", "bin", "next");
const build = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: workspace,
  env: { ...process.env, JOBPILOT_SITES_STANDALONE: "true" },
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
