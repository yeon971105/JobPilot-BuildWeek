import {
  DECISION_STUDY_CONSENT_VERSION,
  DECISION_STUDY_CSV_HEADERS,
  studyCollectionState,
  type StudyCollectionState,
} from "@/lib/decision-study";
import { analyzeImpactStudyCsv, formatStudyCsv, parseStudyCsv } from "@/lib/impact-study";

export type StudyInboxFile = { name: string; csvText: string };

export type StudyInboxValidation = {
  schemaVersion: "jobpilot.bw10.study-inbox-validation.v1";
  valid: boolean;
  status: StudyCollectionState;
  fileCount: number;
  completeParticipantCount: number;
  humanRowCount: number;
  rejectedFileCount: number;
  fabricatedParticipantRows: 0;
  dryRunRowsCountedAsHumans: 0;
  errors: string[];
  acceptedFiles: Array<{ name: string; participantId: string; rowCount: 2 }>;
  combinedCsv: string | null;
};

const PROHIBITED_HEADER = /(^|_)(name|email|phone|resume|demographic|employment_status|health|home_address|ip|ip_address|address)(_|$)/i;

function errorFor(fileName: string, message: string) {
  return `${fileName}: ${message}`;
}

export function validateStudyInbox(files: StudyInboxFile[]): StudyInboxValidation {
  const errors: string[] = [];
  const acceptedFiles: StudyInboxValidation["acceptedFiles"] = [];
  const acceptedRows: Array<{ participantId: string; rows: string[][] }> = [];
  const seenParticipants = new Set<string>();

  for (const file of [...files].sort((left, right) => left.name.localeCompare(right.name))) {
    try {
      const parsed = parseStudyCsv(file.csvText);
      const headers = parsed[0] ?? [];
      if (headers.some((header) => PROHIBITED_HEADER.test(header))) throw new Error("contains a prohibited identifying column");
      if (JSON.stringify(headers) !== JSON.stringify([...DECISION_STUDY_CSV_HEADERS])) throw new Error("headers do not match the frozen no-PII schema");
      const dataRows = parsed.slice(1).filter((row) => JSON.stringify(row) !== JSON.stringify(headers));
      if (dataRows.length !== 2) throw new Error("must contain exactly two completed condition rows");
      if (dataRows.some((row) => row.length !== headers.length)) throw new Error("contains a malformed row");

      const indexes = Object.fromEntries(headers.map((header, index) => [header, index]));
      const values = (name: string) => dataRows.map((row) => row[indexes[name]!] ?? "");
      if (values("synthetic_tooling_validation").some((value) => value !== "false")) throw new Error("dry-run, synthetic, or unlabeled tooling rows are not accepted into the human inbox");
      const participantIds = new Set(values("participant_id"));
      if (participantIds.size !== 1) throw new Error("must contain exactly one anonymous participant ID");
      const participantId = [...participantIds][0]!;
      if (seenParticipants.has(participantId)) throw new Error(`duplicates participant ${participantId} across inbox files`);
      if (new Set(values("condition")).size !== 2 || !values("condition").includes("RAW_POSTING") || !values("condition").includes("JOBPILOT")) throw new Error("must contain one Raw Posting row and one JobPilot row");
      if (new Set(values("condition_order")).size !== 1) throw new Error("contains mismatched condition order values");
      if (values("consent_version").some((value) => value !== DECISION_STUDY_CONSENT_VERSION)) throw new Error("contains a missing or mismatched consent version");

      const fileAnalysis = analyzeImpactStudyCsv(file.csvText, { bootstrapIterations: 100 });
      if (fileAnalysis.humanParticipantCount !== 1 || fileAnalysis.humanRows !== 2 || fileAnalysis.syntheticToolingValidationRows !== 0) throw new Error("does not represent one complete authentic collection record");

      seenParticipants.add(participantId);
      acceptedFiles.push({ name: file.name, participantId, rowCount: 2 });
      acceptedRows.push({ participantId, rows: dataRows });
    } catch (error) {
      errors.push(errorFor(file.name, error instanceof Error ? error.message : String(error)));
    }
  }

  const valid = errors.length === 0;
  const completeParticipantCount = valid ? acceptedFiles.length : 0;
  const combinedRows = acceptedRows
    .sort((left, right) => left.participantId.localeCompare(right.participantId))
    .flatMap(({ rows }) => rows);
  return {
    schemaVersion: "jobpilot.bw10.study-inbox-validation.v1",
    valid,
    status: studyCollectionState(completeParticipantCount),
    fileCount: files.length,
    completeParticipantCount,
    humanRowCount: completeParticipantCount * 2,
    rejectedFileCount: errors.length,
    fabricatedParticipantRows: 0,
    dryRunRowsCountedAsHumans: 0,
    errors,
    acceptedFiles: valid ? acceptedFiles : [],
    combinedCsv: valid ? formatStudyCsv([[...DECISION_STUDY_CSV_HEADERS], ...combinedRows]) : null,
  };
}
