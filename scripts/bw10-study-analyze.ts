import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeImpactStudyCsv, publicImpactSummary } from "../src/lib/impact-study";
import { relativeToCwd, sha256 } from "./bw10-study-utils";

const display = (value: number | null) => value === null ? "—" : String(value);

async function main() {
  const inputPath = path.resolve(process.argv[2] ?? "build-week/study/validated/combined.csv");
  const outputDirectory = path.resolve("build-week/study");
  const csv = await readFile(inputPath, "utf8");
  const analysis = analyzeImpactStudyCsv(csv);
  if (analysis.syntheticToolingValidationRows !== 0) throw new Error("Validated combined input must not contain dry-run or synthetic tooling rows.");
  const publicSummary = publicImpactSummary(analysis);
  const generatedAt = new Date().toISOString();
  const source = { path: relativeToCwd(inputPath), sha256: sha256(csv) };
  const internal = { ...analysis, schemaVersion: "jobpilot.bw10.internal-impact-results.v1", generatedAt, source };
  const publicResult = { ...publicSummary, schemaVersion: "jobpilot.bw10.public-impact-summary.v1", generatedAt, sourceSha256: source.sha256 };
  const internalMarkdown = `# JobPilot Decision Utility study — internal results

Status: **${analysis.status}**

- Actual complete participants: ${analysis.humanParticipantCount}
- Complete paired sessions: ${analysis.humanParticipantCount}
- Human rows: ${analysis.humanRows}
- Dry-run rows counted as humans: 0
- Fabricated participant rows: 0

| Measure | Raw Posting | JobPilot | Paired JobPilot − Raw |
| --- | ---: | ---: | ---: |
| Median completion time (seconds) | ${display(analysis.conditions.RAW_POSTING.medianDecisionTimeSeconds)} | ${display(analysis.conditions.JOBPILOT.medianDecisionTimeSeconds)} | ${display(analysis.paired.medianTimeDifferenceSecondsJobPilotMinusRaw)} |
| Median percentage time change | — | — | ${display(analysis.paired.medianPercentageTimeChangeJobPilotVsRaw)}% |
| Required-experience accuracy (%) | ${display(analysis.conditions.RAW_POSTING.requiredExperienceAccuracyPercent)} | ${display(analysis.conditions.JOBPILOT.requiredExperienceAccuracyPercent)} | ${display(analysis.paired.requiredExperienceAccuracyDifferencePoints)} pp |
| Preferred-experience accuracy (%) | ${display(analysis.conditions.RAW_POSTING.preferredExperienceAccuracyPercent)} | ${display(analysis.conditions.JOBPILOT.preferredExperienceAccuracyPercent)} | ${display(analysis.paired.preferredExperienceAccuracyDifferencePoints)} pp |
| Work-mode accuracy (%) | ${display(analysis.conditions.RAW_POSTING.workModeAccuracyPercent)} | ${display(analysis.conditions.JOBPILOT.workModeAccuracyPercent)} | ${display(analysis.paired.workModeAccuracyDifferencePoints)} pp |
| Biggest-gap accuracy (%) | ${display(analysis.conditions.RAW_POSTING.biggestGapAccuracyPercent)} | ${display(analysis.conditions.JOBPILOT.biggestGapAccuracyPercent)} | ${display(analysis.paired.biggestGapAccuracyDifferencePoints)} pp |
| Mean confidence (1–7) | ${display(analysis.conditions.RAW_POSTING.meanConfidence)} | ${display(analysis.conditions.JOBPILOT.meanConfidence)} | ${display(analysis.paired.meanConfidenceDifferenceJobPilotMinusRaw)} |
| Mean transparency (1–7) | ${display(analysis.conditions.RAW_POSTING.meanTransparency)} | ${display(analysis.conditions.JOBPILOT.meanTransparency)} | ${display(analysis.paired.meanTransparencyDifferenceJobPilotMinusRaw)} |

Apply / Review / Skip agreement: ${display(analysis.paired.decisionAgreementPercent)}%.

Bootstrap status: ${analysis.bootstrapStatus}. Statistical-significance claim: **No**.

${analysis.inferenceBoundary}
`;
  const publicMarkdown = `# JobPilot early usability study

Status: **${publicSummary.status}**  
Actual complete participants: **${publicSummary.humanParticipantCount}**

${publicSummary.summary}

${publicSummary.metrics === null ? "No public impact metric is published because fewer than five authentic complete participants are available." : "Directional usability evidence from a small sample; not hiring-outcome calibration."}

No participant-level records or anonymous participant IDs are published.
`;
  const provenance = {
    schemaVersion: "jobpilot.bw10.analysis-provenance.v1",
    generatedAt,
    analyzer: "src/lib/impact-study.ts",
    command: `npm run study:analyze -- ${source.path}`,
    source,
    actualParticipantCount: analysis.humanParticipantCount,
    completePairedSessions: analysis.humanParticipantCount,
    syntheticToolingRowsAccepted: 0,
    fabricatedParticipantRows: 0,
    bootstrap: { status: analysis.bootstrapStatus, iterations: analysis.bootstrapConfidenceIntervals ? 5_000 : 0, deterministicSeed: analysis.bootstrapConfidenceIntervals ? 2_026_071_8 : null },
    claimBoundary: analysis.inferenceBoundary,
  };
  await Promise.all([
    writeFile(path.join(outputDirectory, "internal-results.json"), `${JSON.stringify(internal, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "internal-report.md"), internalMarkdown, "utf8"),
    writeFile(path.join(outputDirectory, "public-summary.json"), `${JSON.stringify(publicResult, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "public-summary.md"), publicMarkdown, "utf8"),
    writeFile(path.join(outputDirectory, "analysis-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`, "utf8"),
  ]);
  console.log(JSON.stringify({ source, status: analysis.status, actualParticipantCount: analysis.humanParticipantCount, publicMetricsPublished: publicSummary.metrics !== null, fabricatedParticipantRows: 0 }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
