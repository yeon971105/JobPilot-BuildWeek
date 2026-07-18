import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = 3215;
const baseUrl = `http://127.0.0.1:${port}`;
const nodeCommand = process.execPath;

const build = spawnSync(nodeCommand, [resolve(root, "node_modules/next/dist/bin/next"), "build"], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn(nodeCommand, [resolve(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
  cwd: root,
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

let result = 1;
try {
  await waitForServer();
  const test = spawnSync(nodeCommand, [resolve(root, "node_modules/vitest/vitest.mjs"), "run", "tests/visual/css-pipeline.spec.ts"], {
    cwd: root,
    env: { ...process.env, BW5_BASE_URL: baseUrl },
    stdio: "inherit",
  });
  result = test.status ?? 1;
} finally {
  if (server.exitCode === null) {
    server.kill();
    await Promise.race([once(server, "exit"), new Promise((resolveDelay) => setTimeout(resolveDelay, 5000))]);
  }
}

process.exit(result);
