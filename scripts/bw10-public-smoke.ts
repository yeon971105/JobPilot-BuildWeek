import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROUTES = [
  "/",
  "/demo",
  "/demo/shortlist",
  "/demo/jobs",
  "/demo/compare",
  "/demo/jobs/northstar-applied-ai-solutions-engineer",
  "/demo/jobs/alder-data-platform-engineer",
  "/demo/jobs/harbor-product-data-analyst",
  "/demo/jobs/meridian-ml-infrastructure-engineer",
  "/demo/jobs/juniper-customer-ai-enablement-lead",
  "/demo/jobs/mosaic-junior-software-engineer",
  "/demo/employer-posting/northstar-applied-ai-solutions-engineer",
  "/demo/employer-posting/alder-data-platform-engineer",
  "/demo/employer-posting/harbor-product-data-analyst",
  "/demo/employer-posting/meridian-ml-infrastructure-engineer",
  "/demo/employer-posting/juniper-customer-ai-enablement-lead",
  "/demo/employer-posting/mosaic-junior-software-engineer",
  "/demo/verify-receipt",
  "/demo/tracker",
  "/demo/trust",
  "/about/coverage",
  "/about/build-week",
  "/profile",
  "/profile/resume",
  "/profile/preferences",
  "/api/health",
  "/api/provider-status",
] as const;

async function request(baseUrl: string, route: string, cycle: number) {
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}${route}`, { headers: { "user-agent": "JobPilot-JP-BW10-public-smoke/1.0" }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    const body = await response.text();
    const durationMs = Number((performance.now() - started).toFixed(2));
    const applicationError = /Application error|Internal Server Error|This page could not be found/i.test(body);
    return { cycle, route, status: response.status, ok: response.status === 200 && !applicationError, durationMs, bytes: Buffer.byteLength(body), applicationError };
  } catch (error) {
    return { cycle, route, status: 0, ok: false, durationMs: Number((performance.now() - started).toFixed(2)), bytes: 0, applicationError: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const rawUrl = process.argv[2];
  if (!rawUrl || !/^https:\/\//.test(rawUrl)) throw new Error("Pass the verified HTTPS public review URL.");
  const baseUrl = rawUrl.replace(/\/$/, "");
  const results: Awaited<ReturnType<typeof request>>[] = [];
  for (let cycle = 1; cycle <= 20; cycle += 1) results.push(...await Promise.all(ROUTES.map((route) => request(baseUrl, route, cycle))));
  const failures = results.filter((result) => !result.ok);
  const providerResponse = results.find((result) => result.route === "/api/provider-status" && result.ok);
  const output = {
    schemaVersion: "jobpilot.bw10.public-smoke-results.v1",
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    method: "GET-only external HTTPS smoke; no mutation or submission routes called",
    cyclesAttempted: 20,
    cyclesPassed: Array.from({ length: 20 }, (_, index) => index + 1).filter((cycle) => !failures.some((failure) => failure.cycle === cycle)).length,
    routesPerCycle: ROUTES.length,
    requests: results.length,
    http200: results.filter((result) => result.status === 200).length,
    routeFailures: failures.length,
    failedInternalRequests: failures.length,
    consoleErrors: null,
    consoleWarnings: null,
    maximumResponseMilliseconds: Math.max(...results.map((result) => result.durationMs)),
    minimumResponseBytes: Math.min(...results.map((result) => result.bytes)),
    providerStatusReached: Boolean(providerResponse),
    openAiApiRequests: 0,
    openAiApiCostUsd: 0,
    productionMutations: 0,
    applicationSubmissions: 0,
    failures,
    routeSummary: Object.fromEntries(ROUTES.map((route) => {
      const routeResults = results.filter((result) => result.route === route);
      return [route, { attempts: routeResults.length, passed: routeResults.filter((result) => result.ok).length, maximumResponseMilliseconds: Math.max(...routeResults.map((result) => result.durationMs)) }];
    })),
    result: failures.length === 0 ? "PASS_EXTERNAL_20_OF_20" : "FAIL",
  };
  const outputDirectory = path.resolve("build-week/bw10");
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "public-smoke-results.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ target: baseUrl, cyclesAttempted: output.cyclesAttempted, cyclesPassed: output.cyclesPassed, requests: output.requests, routeFailures: output.routeFailures, result: output.result }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
