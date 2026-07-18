import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeImpactStudyCsv, publicImpactSummary } from "../src/lib/impact-study";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function value(value: number | null) {
  return value === null ? "—" : String(value);
}

async function main() {
  const positional = process.argv.slice(2).find((item) => !item.startsWith("--") && item !== argument("--output-dir"));
  const inputPath = path.resolve(positional ?? "build-week/study/response-template.csv");
  const outputDirectory = path.resolve(argument("--output-dir") ?? "build-week/bw9");
  const csv = await readFile(inputPath, "utf8");
  const analysis = analyzeImpactStudyCsv(csv);
  const publicSummary = publicImpactSummary(analysis);
  const generatedAt = new Date().toISOString();
  const source = { path: path.relative(process.cwd(), inputPath).replaceAll("\\", "/"), sha256: createHash("sha256").update(csv).digest("hex") };
  const internal = { generatedAt, source, ...analysis };
  const publicResult = { generatedAt, sourceSha256: source.sha256, ...publicSummary };
  const internalMarkdown = `# JobPilot human impact study — internal report

Status: **${analysis.status}**

- Actual participants: ${analysis.humanParticipantCount}
- Minimum target: ${analysis.minimumParticipantTarget}
- Preferred target: ${analysis.preferredParticipantTarget}
- Human rows: ${analysis.humanRows}
- Synthetic tooling rows excluded: ${analysis.syntheticToolingValidationRows}

## Condition results

| Measure | Raw Posting | JobPilot | Paired JobPilot − Raw |
| --- | ---: | ---: | ---: |
| Median decision time (seconds) | ${value(analysis.conditions.RAW_POSTING.medianDecisionTimeSeconds)} | ${value(analysis.conditions.JOBPILOT.medianDecisionTimeSeconds)} | ${value(analysis.paired.medianTimeDifferenceSecondsJobPilotMinusRaw)} |
| Required-experience accuracy (%) | ${value(analysis.conditions.RAW_POSTING.requiredExperienceAccuracyPercent)} | ${value(analysis.conditions.JOBPILOT.requiredExperienceAccuracyPercent)} | ${value(analysis.paired.requiredExperienceAccuracyDifferencePoints)} pp |
| Preferred-experience accuracy (%) | ${value(analysis.conditions.RAW_POSTING.preferredExperienceAccuracyPercent)} | ${value(analysis.conditions.JOBPILOT.preferredExperienceAccuracyPercent)} | ${value(analysis.paired.preferredExperienceAccuracyDifferencePoints)} pp |
| Work-mode accuracy (%) | ${value(analysis.conditions.RAW_POSTING.workModeAccuracyPercent)} | ${value(analysis.conditions.JOBPILOT.workModeAccuracyPercent)} | ${value(analysis.paired.workModeAccuracyDifferencePoints)} pp |
| Biggest-gap accuracy (%) | ${value(analysis.conditions.RAW_POSTING.biggestGapAccuracyPercent)} | ${value(analysis.conditions.JOBPILOT.biggestGapAccuracyPercent)} | ${value(analysis.paired.biggestGapAccuracyDifferencePoints)} pp |
| Mean confidence (1–7) | ${value(analysis.conditions.RAW_POSTING.meanConfidence)} | ${value(analysis.conditions.JOBPILOT.meanConfidence)} | ${value(analysis.paired.meanConfidenceDifferenceJobPilotMinusRaw)} |
| Mean transparency (1–7) | ${value(analysis.conditions.RAW_POSTING.meanTransparency)} | ${value(analysis.conditions.JOBPILOT.meanTransparency)} | ${value(analysis.paired.meanTransparencyDifferenceJobPilotMinusRaw)} |

Decision agreement: ${value(analysis.paired.decisionAgreementPercent)}%.

Bootstrap status: ${analysis.bootstrapStatus}. Statistical-significance claim: **No**.

${analysis.inferenceBoundary}
`;
  const publicMarkdown = `# JobPilot early usability summary

Status: **${publicSummary.status}**
Actual participants: **${publicSummary.humanParticipantCount}**

${publicSummary.summary}

No participant names, contact details, resumes, demographics, employment status, or health data are collected. Statistical-significance claim: **No**.
`;
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "impact-results-internal.json"), `${JSON.stringify(internal, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "impact-results-public.json"), `${JSON.stringify(publicResult, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "impact-results-internal.md"), internalMarkdown, "utf8"),
    writeFile(path.join(outputDirectory, "impact-results-public.md"), publicMarkdown, "utf8"),
  ]);
  console.log(JSON.stringify({ input: source, outputDirectory, status: analysis.status, actualParticipants: analysis.humanParticipantCount, humanRows: analysis.humanRows, bootstrapStatus: analysis.bootstrapStatus, fabricatedParticipants: 0 }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
