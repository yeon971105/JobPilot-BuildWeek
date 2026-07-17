import { readFile } from "node:fs/promises";
import path from "node:path";

const required = ["candidate-profile.json", "jobs.json", "expected-analysis.json"];
async function main() {
  const root = path.join(process.cwd(), "build-week", "demo-data");
  const jobs = JSON.parse(await readFile(path.join(root, "jobs.json"), "utf8")) as Array<{ id: string; locations: { workModes: string[] }[] }>;
  const candidate = JSON.parse(await readFile(path.join(root, "candidate-profile.json"), "utf8")) as { synthetic?: boolean; evidence?: unknown[] };
  await Promise.all(required.map((name) => readFile(path.join(root, name), "utf8")));
  if (jobs.length < 6 || !candidate.synthetic || !candidate.evidence?.length) throw new Error("Build Week demo data is incomplete.");
  console.log(JSON.stringify({ status: "ready", synthetic: true, jobs: jobs.length, workModes: [...new Set(jobs.flatMap((job) => job.locations.flatMap((location) => location.workModes)))].sort(), liveGpt56Configured: Boolean(process.env.OPENAI_API_KEY && process.env.BUILD_WEEK_ALLOW_LIVE_GPT56 === "true") }, null, 2));
}
main();
