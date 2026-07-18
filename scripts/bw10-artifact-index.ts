import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const outputPath = path.join(workspace, "build-week", "bw10", "artifact-index.json");
const roots = [
  path.join(workspace, "build-week", "bw10"),
  path.join(workspace, "build-week", "devpost"),
];
const exactFiles = [
  "build-week/codex-session.json",
  "build-week/study/internal-results.json",
  "build-week/study/internal-report.md",
  "build-week/study/public-summary.json",
  "build-week/study/public-summary.md",
  "build-week/study/analysis-provenance.json",
  "build-week/video/jobpilot-winning-rc1-demo.mp4",
  "build-week/video/jobpilot-winning-rc1-captions.srt",
  "build-week/video/jobpilot-winning-rc1-voiceover.md",
  "README.md",
  "CODEX_BUILD_LOG.md",
];

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

async function main() {
  const discovered = (await Promise.all(roots.map(walk))).flat();
  const candidates = [...new Set([...discovered, ...exactFiles.map((file) => path.join(workspace, file))])]
    .filter((file) => file !== outputPath)
    .sort((left, right) => left.localeCompare(right));
  const artifacts = await Promise.all(candidates.map(async (file) => {
    const bytes = await readFile(file);
    const metadata = await stat(file);
    return {
      path: path.relative(workspace, file).replaceAll("\\", "/"),
      bytes: metadata.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }));
  const output = {
    schemaVersion: "jobpilot.bw10.artifact-index.v1",
    generatedAt: new Date().toISOString(),
    algorithm: "SHA-256",
    participantLevelRecordsIncluded: false,
    artifactCount: artifacts.length,
    artifacts,
  };
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ artifactCount: artifacts.length, output: path.relative(workspace, outputPath).replaceAll("\\", "/") }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
