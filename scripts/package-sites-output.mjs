import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const workspace = process.cwd();
const source = path.resolve(workspace, ".open-next");
const output = path.resolve(workspace, "dist");
if (path.dirname(output) !== workspace || path.basename(output) !== "dist") throw new Error("Refusing to package outside the workspace dist directory.");
if (!existsSync(path.join(source, "worker.js"))) throw new Error("OpenNext Worker output is missing.");

rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, "server"), { recursive: true });
mkdirSync(path.join(output, ".openai"), { recursive: true });
cpSync(source, path.join(output, "server"), { recursive: true });
renameSync(path.join(output, "server", "worker.js"), path.join(output, "server", "worker.mjs"));
writeFileSync(path.join(output, "server", "index.js"), `import { createRequire } from "node:module";
globalThis.require ??= createRequire("file:///jobpilot-worker/index.js");
const worker = await import("./worker.mjs");
export default worker.default;
export const DOQueueHandler = worker.DOQueueHandler;
export const DOShardedTagCache = worker.DOShardedTagCache;
export const BucketCachePurge = worker.BucketCachePurge;
`, "utf8");
cpSync(path.join(source, "assets"), path.join(output, "client"), { recursive: true });
cpSync(path.join(workspace, ".openai", "hosting.json"), path.join(output, ".openai", "hosting.json"));

const bundleDirectory = mkdtempSync(path.join(os.tmpdir(), "jobpilot-sites-worker-"));
try {
  const wranglerCommand = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const workerBundle = spawnSync(wranglerCommand, [
    "deploy",
    path.join(output, "server", "index.js"),
    "--assets",
    path.join(output, "client"),
    "--dry-run",
    "--outdir",
    bundleDirectory,
    "--compatibility-date",
    "2026-07-18",
    "--compatibility-flag",
    "nodejs_compat",
  ], {
    cwd: workspace,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (workerBundle.status !== 0) process.exit(workerBundle.status ?? 1);
  cpSync(path.join(bundleDirectory, "index.js"), path.join(output, "server", "index.js"));
} finally {
  rmSync(bundleDirectory, { recursive: true, force: true });
}

console.log(JSON.stringify({ status: "PASS", entrypoint: "dist/server/index.js", hosting: "dist/.openai/hosting.json" }));
