import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateStudyInbox } from "../src/lib/study-collection";
import { readStudyInbox, relativeToCwd, sha256 } from "./bw10-study-utils";

async function main() {
  const input = process.argv[2] ?? "build-week/study/inbox";
  const outputDirectory = path.resolve("build-week/study/validated");
  const { root, files } = await readStudyInbox(input);
  const result = validateStudyInbox(files);
  if (!result.valid || result.combinedCsv === null) throw new Error(`Study inbox validation failed:\n${result.errors.join("\n")}`);
  const outputPath = path.join(outputDirectory, "combined.csv");
  const manifest = {
    schemaVersion: "jobpilot.bw10.study-combination.v1",
    generatedAt: new Date().toISOString(),
    inputDirectory: relativeToCwd(root),
    outputPath: relativeToCwd(outputPath),
    status: result.status,
    completeParticipantCount: result.completeParticipantCount,
    humanRowCount: result.humanRowCount,
    fabricatedParticipantRows: 0,
    dryRunRowsCountedAsHumans: 0,
    sources: files.map((file) => ({ name: file.name, sha256: sha256(file.csvText) })),
    outputSha256: sha256(result.combinedCsv),
  };
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(outputPath, result.combinedCsv, "utf8"),
    writeFile(path.join(outputDirectory, "combination-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
  ]);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
