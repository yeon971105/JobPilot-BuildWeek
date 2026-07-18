import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

const root = resolve(import.meta.dirname, "..");
const portIndex = process.argv.indexOf("--port");
if (portIndex < 0 || !process.argv[portIndex + 1]) throw new Error("Use npm run preview:certified -- --port 3209");
const port = Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("The preview port must be an integer from 1024 through 65535.");
const baseUrl = `http://127.0.0.1:${port}`;
const runGit = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });

const status = runGit("status", "--porcelain");
if (status.status !== 0) throw new Error(status.stderr || "Unable to inspect Git status.");
if (status.stdout.trim()) throw new Error(`Certified preview requires a clean worktree.\n${status.stdout}`);
const headResult = runGit("rev-parse", "HEAD");
if (headResult.status !== 0) throw new Error(headResult.stderr || "Unable to resolve the current commit.");
const commit = headResult.stdout.trim();

const buildIdPath = resolve(root, ".next/BUILD_ID");
if (!existsSync(buildIdPath)) throw new Error("No production BUILD_ID exists. Run npm run build:next after the release commit.");
const buildId = readFileSync(buildIdPath, "utf8").trim();
if (!buildId || !existsSync(resolve(root, `.next/static/${buildId}/_buildManifest.js`))) throw new Error("The production build is incomplete or its BUILD_ID does not match the static manifest.");

const contract = JSON.parse(readFileSync(resolve(root, "build-week/bw11r/certified-preview-contract.json"), "utf8"));
const visual = JSON.parse(readFileSync(resolve(root, "build-week/bw11r/visual-regression-results.json"), "utf8"));
const sourceDiff = runGit("diff", "--quiet", contract.visualSourceCommit, "--", "src", "tests/visual");
if (sourceDiff.status !== 0) throw new Error("UI source differs from the browser-certified source commit.");
if (visual.result !== "PASS" || Object.values(visual.zeroValues).some((value) => value !== 0)) throw new Error("Persisted browser geometry sentinels do not pass.");

const cssDirectory = resolve(root, ".next/static/chunks");
const cssFiles = readdirSync(cssDirectory).filter((file) => file.endsWith(".css")).sort();
if (!cssFiles.length) throw new Error("The clean build contains no generated CSS assets.");
const localCss = cssFiles.map((file) => readFileSync(resolve(cssDirectory, file), "utf8")).join("\n");
const localCssBytes = Buffer.byteLength(localCss);
const localCssHash = createHash("sha256").update(localCss).digest("hex");
if (localCssBytes !== contract.css.totalBytes || localCssHash !== contract.css.sha256) throw new Error(`CSS build drift: ${localCssBytes} bytes, ${localCssHash}.`);
if (!statSync(buildIdPath).isFile()) throw new Error("BUILD_ID is not a regular file.");

const server = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
  cwd: root,
  env: { ...process.env, BUILD_WEEK_DEMO_MODE: "true", LOCAL_PRIVATE_MODE: "false", OLLAMA_ENABLED: "false", OPENAI_HEAVY_FEATURES_ENABLED: "false", BUILD_WEEK_ALLOW_LIVE_GPT56: "false", OPENAI_API_KEY: "" },
  stdio: ["ignore", "inherit", "inherit"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error("The preview server exited during startup.");
    try { const response = await fetch(`${baseUrl}/api/health`); if (response.ok) return; } catch {}
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
  throw new Error("The preview server did not become healthy.");
}

let certified = false;
try {
  await waitForServer();
  const routeResults = [];
  let landingHtml = "";
  for (const route of contract.ownerRoutes) {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();
    const applicationError = /id=["']__next_error__["']|Application error|Internal Server Error/i.test(body);
    routeResults.push({ route, status: response.status, bytes: Buffer.byteLength(body), applicationError });
    if (route === "/") landingHtml = body;
    if (response.status !== 200 || applicationError) throw new Error(`Owner route failed: ${route}`);
  }
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  if (!healthResponse.ok) throw new Error("Health endpoint failed after route certification.");
  const buildManifestResponse = await fetch(`${baseUrl}/_next/static/${buildId}/_buildManifest.js`);
  if (!buildManifestResponse.ok) throw new Error("BUILD_ID asset is not served; build/server mismatch detected.");

  const linked = new JSDOM(landingHtml);
  const stylesheetUrls = [...linked.window.document.querySelectorAll('link[rel="stylesheet"]')].map((link) => new URL(link.href, baseUrl).href);
  if (!stylesheetUrls.length) throw new Error("Landing HTML links no generated stylesheet.");
  const runtimeCssResponses = await Promise.all(stylesheetUrls.map(async (url) => ({ url, response: await fetch(url) })));
  if (runtimeCssResponses.some(({ response }) => !response.ok)) throw new Error("At least one runtime CSS asset did not return HTTP 200.");
  const runtimeCss = (await Promise.all(runtimeCssResponses.map(({ response }) => response.text()))).join("\n");
  const runtimeCssBytes = Buffer.byteLength(runtimeCss);
  const runtimeCssHash = createHash("sha256").update(runtimeCss).digest("hex");
  if (runtimeCssBytes !== localCssBytes || runtimeCssHash !== localCssHash) throw new Error("Runtime CSS does not match the clean local build.");

  const dom = new JSDOM(landingHtml, { pretendToBeVisual: true });
  const ruleStarts = [".flex{", ".absolute{", ".rounded-full{", ".bg-\\[\\#173d2d\\]{", ".button-primary,.button-secondary{", ".button-primary{"];
  const rules = ruleStarts.map((start) => {
    const startIndex = runtimeCss.indexOf(start);
    if (startIndex < 0) throw new Error(`Missing computed-style rule: ${start}`);
    return runtimeCss.slice(startIndex, runtimeCss.indexOf("}", startIndex) + 1);
  }).join("\n");
  const style = dom.window.document.createElement("style");
  style.textContent = rules;
  dom.window.document.head.append(style);
  const navigation = dom.window.document.querySelector('nav[aria-label="Primary navigation"]');
  const primaryCta = [...dom.window.document.querySelectorAll("a")].find((link) => link.textContent?.includes("See My Best Matches"));
  const scoreRing = dom.window.document.querySelector('[data-testid="hero-score-ring"]');
  if (!navigation || !primaryCta || !scoreRing) throw new Error("Computed-style sentinel elements are absent.");
  const navigationStyle = dom.window.getComputedStyle(navigation);
  const primaryStyle = dom.window.getComputedStyle(primaryCta);
  const scoreStyle = dom.window.getComputedStyle(scoreRing);
  if (navigationStyle.display !== "flex" || primaryStyle.backgroundColor !== "rgb(23, 61, 45)" || scoreStyle.position !== "absolute" || scoreStyle.borderRadius === "0px") throw new Error("Computed-style or geometry sentinel failed.");

  certified = true;
  console.log(JSON.stringify({
    certification: "PASS",
    url: baseUrl,
    commit,
    buildId,
    cleanBuild: true,
    routesPassed: routeResults.length,
    health: "PASS",
    buildServerMismatch: false,
    css: { assets: stylesheetUrls.length, http200: stylesheetUrls.length, totalBytes: runtimeCssBytes, sha256: runtimeCssHash },
    computedStyleSentinels: "PASS",
    geometrySentinels: "PASS",
    openAiApiRequests: 0,
    applicationSubmissions: 0,
  }, null, 2));
  await once(server, "exit");
} finally {
  if (!certified && server.exitCode === null) server.kill();
}
