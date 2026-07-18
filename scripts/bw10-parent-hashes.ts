import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const parent = "029e2e8a31863ec185784c5699cf77a319099aea";
const scopes = [
  "build-week/bw9",
  "build-week/study",
  "build-week/video/jobpilot-winning-rc1-demo.mp4",
  "README.md",
  "CODEX_BUILD_LOG.md",
];

function git(...args: string[]) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).trim();
}

async function main() {
  const files = git("ls-tree", "-r", "--name-only", parent, "--", ...scopes).split(/\r?\n/).filter(Boolean);
  const entries = files.map((file) => {
    const blobBytes = execFileSync("git", ["cat-file", "blob", `${parent}:${file}`], { maxBuffer: 32 * 1024 * 1024 });
    return { path: file, bytes: blobBytes.length, sha256: createHash("sha256").update(blobBytes).digest("hex") };
  });
  const output = {
    schemaVersion: "jobpilot.bw10.parent-artifact-hashes.v1",
    generatedAt: new Date().toISOString(),
    parentCommit: parent,
    algorithm: "SHA-256",
    source: "immutable Git blobs from the reproduced parent commit",
    artifactCount: entries.length,
    entries,
  };
  const outputDirectory = path.resolve("build-week/bw10");
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "parent-artifact-hashes.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ parent, artifactCount: entries.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
