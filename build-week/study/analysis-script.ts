import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const expectedHeaders = ["participant_id", "condition_order", "condition", "task_seconds", "required_answer", "preferred_answer", "work_mode_answer", "biggest_gap_answer", "decision", "confidence_1_to_7", "transparency_1_to_7", "synthetic_tooling_validation"];

function parseCsv(value: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]!;
    if (character === '"') {
      if (quoted && value[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(field); field = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && value[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += character;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const inputPath = resolve(process.argv[2] ?? "build-week/study/response-template.csv");
const parsed = parseCsv(readFileSync(inputPath, "utf8"));
const headers = parsed[0] ?? [];
if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) throw new Error("Study CSV headers do not match the frozen no-PII schema.");
const index = Object.fromEntries(headers.map((header, position) => [header, position]));
const rows = parsed.slice(1);
if (rows.some((row) => row.length !== headers.length)) throw new Error("Study CSV contains a malformed row.");
const humanRows = rows.filter((row) => row[index.synthetic_tooling_validation] !== "true");
const participants = new Set(humanRows.map((row) => row[index.participant_id]));
const numeric = (row: string[], field: string) => Number(row[index[field]]);
const median = (values: number[]) => { if (!values.length) return null; const ordered = [...values].sort((left, right) => left - right); const middle = Math.floor(ordered.length / 2); return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1]! + ordered[middle]!) / 2; };
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const byCondition = (condition: string) => humanRows.filter((row) => row[index.condition] === condition);
const summarize = (condition: string) => { const matches = byCondition(condition); return { rows: matches.length, medianTaskSeconds: median(matches.map((row) => numeric(row, "task_seconds"))), meanConfidence: mean(matches.map((row) => numeric(row, "confidence_1_to_7"))), meanTransparency: mean(matches.map((row) => numeric(row, "transparency_1_to_7"))) }; };
const report = {
  status: participants.size ? "HUMAN_DATA_IMPORTED" : "READY_NOT_RUN",
  humanParticipantCount: participants.size,
  humanRows: humanRows.length,
  syntheticToolingValidationRows: rows.length - humanRows.length,
  rawPosting: summarize("RAW_POSTING"),
  jobPilot: summarize("JOBPILOT"),
  randomizedOrderCounts: Object.fromEntries([...new Set(humanRows.map((row) => row[index.condition_order]))].sort().map((order) => [order, humanRows.filter((row) => row[index.condition_order] === order).length / 2])),
  privateOrIdentifyingColumns: 0,
  externalRequests: 0,
  fabricatedHumanResults: 0,
};
console.log(JSON.stringify(report, null, 2));
