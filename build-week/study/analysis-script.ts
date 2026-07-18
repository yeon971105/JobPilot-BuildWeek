import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const expectedHeaders = ["participant_id", ...Array.from({ length: 7 }, (_, index) => `task_${index + 1}_complete`), "time_to_priority_seconds", "time_to_employer_seconds", "facilitator_assists", "score_not_probability_correct", "distance_not_score_correct", "prepared_not_live_correct", "no_auto_apply_correct", "ease_1_to_7", "friction_note"];
const inputPath = resolve(process.argv[2] ?? "build-week/study/response-template.csv");
const lines = readFileSync(inputPath, "utf8").trim().split(/\r?\n/);
const headers = lines[0]?.split(",") ?? [];
if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) throw new Error("Study CSV headers do not match the frozen no-PII schema.");
const rows = lines.slice(1).filter(Boolean).map((line) => line.split(","));
if (rows.some((row) => row.length !== headers.length)) throw new Error("Study CSV contains a malformed row. Quote-free template values are required.");
const index = Object.fromEntries(headers.map((header, position) => [header, position]));
const numeric = (row: string[], field: string) => Number(row[index[field]]);
const median = (values: number[]) => { if (!values.length) return null; const ordered = [...values].sort((left, right) => left - right); const middle = Math.floor(ordered.length / 2); return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1]! + ordered[middle]!) / 2; };
const taskValues = rows.flatMap((row) => Array.from({ length: 7 }, (_, task) => numeric(row, `task_${task + 1}_complete`)));
const comprehensionValues = rows.flatMap((row) => ["score_not_probability_correct", "distance_not_score_correct", "prepared_not_live_correct", "no_auto_apply_correct"].map((field) => numeric(row, field)));
const report = {
  status: rows.length ? "ANALYZED" : "READY_NOT_RUN",
  participantRows: rows.length,
  taskCompletionRate: taskValues.length ? taskValues.reduce((sum, value) => sum + value, 0) / taskValues.length : null,
  medianTimeToPrioritySeconds: median(rows.map((row) => numeric(row, "time_to_priority_seconds"))),
  medianTimeToEmployerSeconds: median(rows.map((row) => numeric(row, "time_to_employer_seconds"))),
  comprehensionRate: comprehensionValues.length ? comprehensionValues.reduce((sum, value) => sum + value, 0) / comprehensionValues.length : null,
  totalFacilitatorAssists: rows.length ? rows.reduce((sum, row) => sum + numeric(row, "facilitator_assists"), 0) : null,
  privateOrIdentifyingColumns: 0,
  externalRequests: 0,
};
console.log(JSON.stringify(report, null, 2));
