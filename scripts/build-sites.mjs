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
await import("./package-sites-output.mjs");
