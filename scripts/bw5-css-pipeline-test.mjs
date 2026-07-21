import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = 3215;
const baseUrl = `http://127.0.0.1:${port}`;
const nodeCommand = process.execPath;
const certificationEnvironment = {
  ...process.env,
  BUILD_WEEK_DEMO_MODE: "true",
  LOCAL_PRIVATE_MODE: "false",
  AI_RUNTIME_MODE: "LOCAL_FIRST",
  BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true",
  BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: "false",
  OLLAMA_ENABLED: "false",
  OPENAI_HEAVY_FEATURES_ENABLED: "false",
  BUILD_WEEK_ALLOW_LIVE_GPT56: "false",
  OPENAI_API_KEY: "",
  JOBPILOT_APPROVED_PRODUCT_COMMIT: "173bf67db276e4639c5a57b6c4a02070222ca8ba",
  JOBPILOT_DEPLOYMENT_COMMIT: "0b3aaba8aa8e8b91a41bf21062ab11cb51325b41",
  JOBPILOT_RELEASE_TAG: "build-week-2026-study-evidence-rc1",
  JOBPILOT_DEPLOYMENT_ENVIRONMENT: "public-review",
  JOBPILOT_DEPLOYED_AT: "2026-07-20T00:00:00.000Z",
};

function createCleanTrackedRoot() {
  const tracked = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "buffer" });
  if (tracked.status !== 0) throw new Error(tracked.stderr.toString() || "Unable to enumerate tracked certification files.");

  const certificationRoot = mkdtempSync(join(tmpdir(), "jobpilot-css-"));
  for (const relativePath of tracked.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const target = resolve(certificationRoot, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(resolve(root, relativePath), target);
  }
  symlinkSync(resolve(root, "node_modules"), resolve(certificationRoot, "node_modules"), "junction");
  return certificationRoot;
}

const certificationRoot = createCleanTrackedRoot();
let result = 1;
try {
  const build = spawnSync(nodeCommand, [resolve(certificationRoot, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
    cwd: certificationRoot,
    env: certificationEnvironment,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    result = build.status ?? 1;
  } else {
    const server = spawn(nodeCommand, [resolve(certificationRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
      cwd: certificationRoot,
      env: certificationEnvironment,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let serverOutput = "";
    server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
    server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

    async function waitForServer() {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        if (server.exitCode !== null) throw new Error(`Production server exited before certification.\n${serverOutput}`);
        try {
          const response = await fetch(baseUrl);
          if (response.ok) return;
        } catch {}
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
      }
      throw new Error(`Production server did not become ready.\n${serverOutput}`);
    }

    try {
      await waitForServer();
      const test = spawnSync(nodeCommand, [resolve(certificationRoot, "node_modules/vitest/vitest.mjs"), "run", "tests/visual/css-pipeline.spec.ts"], {
        cwd: certificationRoot,
        env: { ...certificationEnvironment, BW5_BASE_URL: baseUrl },
        stdio: "inherit",
      });
      result = test.status ?? 1;
    } finally {
      if (server.exitCode === null) {
        server.kill();
        await Promise.race([once(server, "exit"), new Promise((resolveDelay) => setTimeout(resolveDelay, 5000))]);
      }
    }
  }
} finally {
  rmSync(certificationRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
}

process.exit(result);
