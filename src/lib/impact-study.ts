import {
  BIGGEST_GAP_CHOICES,
  DECISION_STUDY_ASSIGNMENTS,
  DECISION_STUDY_CONSENT_VERSION,
  DECISION_STUDY_CSV_HEADERS,
  DECISION_STUDY_PROTOCOL_VERSION,
  DECISION_STUDY_PREFERRED_PARTICIPANTS,
  DECISION_STUDY_ROLES,
  PREFERRED_EXPERIENCE_CHOICES,
  REQUIRED_EXPERIENCE_CHOICES,
  studyCollectionState,
  WORK_MODE_CHOICES,
  type StudyCollectionState,
  type StudyCondition,
  type StudyDecision,
} from "@/lib/decision-study";

export const IMPACT_STUDY_ANSWER_KEY = Object.fromEntries(Object.values(DECISION_STUDY_ROLES).map((role) => [role.id, role.answerKey]));

const ALLOWED_ANSWERS = [REQUIRED_EXPERIENCE_CHOICES, PREFERRED_EXPERIENCE_CHOICES, WORK_MODE_CHOICES, BIGGEST_GAP_CHOICES]
  .map((choices) => new Set<string>(choices.map(([value]) => value).filter(Boolean)));

type ImpactRow = {
  participantId: string;
  assignmentGroup: "GROUP_1" | "GROUP_2";
  roleId: keyof typeof DECISION_STUDY_ROLES;
  conditionOrder: "RAW_POSTING_THEN_JOBPILOT";
  condition: StudyCondition;
  taskSeconds: number;
  requiredExperienceAnswer: string;
  preferredExperienceAnswer: string;
  workModeAnswer: string;
  biggestGapAnswer: string;
  requiredCorrect: boolean;
  preferredCorrect: boolean;
  workCorrect: boolean;
  gapCorrect: boolean;
  decisionAligned: boolean;
  referenceDecision: Exclude<StudyDecision, "">;
  decision: Exclude<StudyDecision, "">;
  confidence: number;
  transparency: number;
  consentVersion: string;
  completedAt: string;
};

type Pair = { participantId: string; RAW_POSTING: ImpactRow; JOBPILOT: ImpactRow };

type ConfidenceInterval = { lower: number; upper: number; confidence: 0.95; iterations: number };

export type ImpactStudyAnalysis = {
  schemaVersion: "jobpilot.bw9.impact-analysis.v1";
  status: StudyCollectionState;
  humanParticipantCount: number;
  humanRows: number;
  syntheticToolingValidationRows: number;
  minimumParticipantTarget: 5;
  preferredParticipantTarget: string;
  conditionOrderCounts: Record<string, number>;
  conditions: Record<StudyCondition, {
    participantCount: number;
    medianDecisionTimeSeconds: number | null;
    requiredExperienceAccuracyPercent: number | null;
    preferredExperienceAccuracyPercent: number | null;
    workModeAccuracyPercent: number | null;
    biggestGapAccuracyPercent: number | null;
    decisionAlignmentPercent: number | null;
    meanConfidence: number | null;
    meanTransparency: number | null;
    decisions: Record<Exclude<StudyDecision, "">, number>;
  }>;
  paired: {
    medianTimeDifferenceSecondsJobPilotMinusRaw: number | null;
    medianPercentageTimeChangeJobPilotVsRaw: number | null;
    requiredExperienceAccuracyDifferencePoints: number | null;
    preferredExperienceAccuracyDifferencePoints: number | null;
    workModeAccuracyDifferencePoints: number | null;
    biggestGapAccuracyDifferencePoints: number | null;
    decisionAlignmentDifferencePoints: number | null;
    decisionAgreementPercent: number | null;
    meanConfidenceDifferenceJobPilotMinusRaw: number | null;
    meanTransparencyDifferenceJobPilotMinusRaw: number | null;
  };
  bootstrapConfidenceIntervals: Record<string, ConfidenceInterval> | null;
  bootstrapStatus: "NOT_AVAILABLE_NO_PARTICIPANTS" | "NOT_AVAILABLE_BELOW_MINIMUM" | "AVAILABLE";
  statisticalSignificanceClaim: false;
  inferenceBoundary: string;
  validation: { duplicateParticipantConditions: 0; incompleteParticipantSessions: 0; malformedRows: 0; prohibitedColumns: 0; fabricatedParticipants: 0 };
};

export function parseStudyCsv(value: string) {
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
      if (row.some((item) => item.length > 0)) rows.push(row);
      row = [];
    } else field += character;
  }
  if (quoted) throw new Error("Study CSV contains an unterminated quoted field.");
  row.push(field);
  if (row.some((item) => item.length > 0)) rows.push(row);
  return rows;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function formatStudyCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const median = (values: number[]) => {
  if (!values.length) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle]! : (ordered[middle - 1]! + ordered[middle]!) / 2;
};
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const percentage = (values: boolean[]) => values.length ? round(values.filter(Boolean).length / values.length * 100) : null;
const difference = (left: number | null, right: number | null) => left === null || right === null ? null : round(left - right);

function numberInRange(value: string, name: string, minimum: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${name} must be an integer from ${minimum} to ${maximum}.`);
  return parsed;
}

function validIso(value: string) {
  return value.length > 0 && Number.isFinite(Date.parse(value));
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4_294_967_296;
  };
}

function percentile(values: number[], fraction: number) {
  const ordered = [...values].sort((left, right) => left - right);
  const index = (ordered.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return ordered[lower]!;
  return ordered[lower]! + (ordered[upper]! - ordered[lower]!) * (index - lower);
}

function pairedMetrics(pairs: Pair[]) {
  const raw = pairs.map((pair) => pair.RAW_POSTING);
  const jobPilot = pairs.map((pair) => pair.JOBPILOT);
  const requiredRaw = raw.map((row) => row.requiredCorrect);
  const requiredJobPilot = jobPilot.map((row) => row.requiredCorrect);
  const preferredRaw = raw.map((row) => row.preferredCorrect);
  const preferredJobPilot = jobPilot.map((row) => row.preferredCorrect);
  const workRaw = raw.map((row) => row.workCorrect);
  const workJobPilot = jobPilot.map((row) => row.workCorrect);
  const gapRaw = raw.map((row) => row.gapCorrect);
  const gapJobPilot = jobPilot.map((row) => row.gapCorrect);
  const alignmentRaw = raw.map((row) => row.decisionAligned);
  const alignmentJobPilot = jobPilot.map((row) => row.decisionAligned);
  return {
    medianTimeDifferenceSecondsJobPilotMinusRaw: median(pairs.map((pair) => pair.JOBPILOT.taskSeconds - pair.RAW_POSTING.taskSeconds)),
    medianPercentageTimeChangeJobPilotVsRaw: median(pairs.map((pair) => round((pair.JOBPILOT.taskSeconds - pair.RAW_POSTING.taskSeconds) / pair.RAW_POSTING.taskSeconds * 100, 2))),
    requiredExperienceAccuracyDifferencePoints: difference(percentage(requiredJobPilot), percentage(requiredRaw)),
    preferredExperienceAccuracyDifferencePoints: difference(percentage(preferredJobPilot), percentage(preferredRaw)),
    workModeAccuracyDifferencePoints: difference(percentage(workJobPilot), percentage(workRaw)),
    biggestGapAccuracyDifferencePoints: difference(percentage(gapJobPilot), percentage(gapRaw)),
    decisionAlignmentDifferencePoints: difference(percentage(alignmentJobPilot), percentage(alignmentRaw)),
    decisionAgreementPercent: percentage(pairs.map((pair) => pair.RAW_POSTING.decision === pair.JOBPILOT.decision)),
    meanConfidenceDifferenceJobPilotMinusRaw: difference(mean(jobPilot.map((row) => row.confidence)), mean(raw.map((row) => row.confidence))),
    meanTransparencyDifferenceJobPilotMinusRaw: difference(mean(jobPilot.map((row) => row.transparency)), mean(raw.map((row) => row.transparency))),
  };
}

function bootstrapIntervals(pairs: Pair[], iterations: number, seed: number) {
  const random = mulberry32(seed);
  const buckets: Record<string, number[]> = {};
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sample = Array.from({ length: pairs.length }, () => pairs[Math.floor(random() * pairs.length)]!);
    const metrics = pairedMetrics(sample);
    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      (buckets[key] ??= []).push(value);
    }
  }
  return Object.fromEntries(Object.entries(buckets).map(([key, values]) => [key, { lower: round(percentile(values, 0.025), 2), upper: round(percentile(values, 0.975), 2), confidence: 0.95 as const, iterations }]));
}

function summarizeCondition(rows: ImpactRow[]) {
  return {
    participantCount: rows.length,
    medianDecisionTimeSeconds: median(rows.map((row) => row.taskSeconds)),
    requiredExperienceAccuracyPercent: percentage(rows.map((row) => row.requiredCorrect)),
    preferredExperienceAccuracyPercent: percentage(rows.map((row) => row.preferredCorrect)),
    workModeAccuracyPercent: percentage(rows.map((row) => row.workCorrect)),
    biggestGapAccuracyPercent: percentage(rows.map((row) => row.gapCorrect)),
    decisionAlignmentPercent: percentage(rows.map((row) => row.decisionAligned)),
    meanConfidence: mean(rows.map((row) => row.confidence)) === null ? null : round(mean(rows.map((row) => row.confidence))!, 2),
    meanTransparency: mean(rows.map((row) => row.transparency)) === null ? null : round(mean(rows.map((row) => row.transparency))!, 2),
    decisions: {
      APPLY: rows.filter((row) => row.decision === "APPLY").length,
      REVIEW_FURTHER: rows.filter((row) => row.decision === "REVIEW_FURTHER").length,
      SKIP: rows.filter((row) => row.decision === "SKIP").length,
    },
  };
}

export function analyzeImpactStudyCsv(csv: string, options: { bootstrapIterations?: number; bootstrapSeed?: number } = {}): ImpactStudyAnalysis {
  const parsed = parseStudyCsv(csv);
  const expectedHeaders = [...DECISION_STUDY_CSV_HEADERS];
  const headers = parsed[0] ?? [];
  if (headers.some((header) => /(^|_)(name|email|phone|resume|demographic|employment_status|health|home_address|ip|ip_address|address)(_|$)/i.test(header))) throw new Error("Study CSV contains a prohibited identifying column.");
  if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) throw new Error("Study CSV headers do not match the frozen no-PII schema.");
  const indexes = Object.fromEntries(headers.map((header, index) => [header, index]));
  const rawRows = parsed.slice(1).filter((row) => JSON.stringify(row) !== JSON.stringify(headers));
  if (rawRows.some((row) => row.length !== headers.length)) throw new Error("Study CSV contains a malformed row.");
  let syntheticToolingValidationRows = 0;
  const humanRows: ImpactRow[] = [];
  const seen = new Set<string>();
  for (const row of rawRows) {
    const field = (name: typeof DECISION_STUDY_CSV_HEADERS[number]) => row[indexes[name]!] ?? "";
    const synthetic = field("synthetic_tooling_validation");
    if (synthetic === "true") { syntheticToolingValidationRows += 1; continue; }
    if (synthetic !== "false") throw new Error("Study row must label synthetic_tooling_validation as true or false.");
    const participantId = field("participant_id");
    const assignmentGroup = field("assignment_group");
    const roleId = field("role_id");
    const conditionOrder = field("condition_order");
    const condition = field("condition");
    if (!/^anon-[a-z0-9-]+$/.test(participantId)) throw new Error("Study participant ID is not an anonymous generated ID.");
    if (field("protocol_version") !== DECISION_STUDY_PROTOCOL_VERSION) throw new Error("Study protocol version is invalid.");
    if (field("phase") !== "FINAL") throw new Error("Only FINAL study rows are accepted for impact analysis.");
    if (field("exclusion_status") !== "ELIGIBLE_FINAL_PENDING_VALIDATION") throw new Error("Study row is excluded from final impact analysis.");
    if (!(assignmentGroup === "GROUP_1" || assignmentGroup === "GROUP_2")) throw new Error("Study assignment is invalid.");
    if (!(roleId in DECISION_STUDY_ROLES)) throw new Error("Study role ID is invalid.");
    if (conditionOrder !== "RAW_POSTING_THEN_JOBPILOT") throw new Error("Study condition order is invalid.");
    if (!(["RAW_POSTING", "JOBPILOT"] as string[]).includes(condition)) throw new Error("Study condition is invalid.");
    const duplicateKey = `${participantId}:${condition}`;
    if (seen.has(duplicateKey)) throw new Error(`Duplicate participant-condition row: ${duplicateKey}`);
    seen.add(duplicateKey);
    const completedAt = field("completed_at");
    if (!validIso(completedAt)) throw new Error("Study completed_at must be a valid timestamp.");
    const decision = field("decision");
    if (!(["APPLY", "REVIEW_FURTHER", "SKIP"] as string[]).includes(decision)) throw new Error("Study decision is invalid.");
    if (field("consent_version") !== DECISION_STUDY_CONSENT_VERSION) throw new Error("Study consent version is missing or invalid.");
    const answers = [field("required_experience_answer"), field("preferred_experience_answer"), field("work_mode_answer"), field("biggest_gap_answer")];
    if (answers.some((answer) => !answer)) throw new Error("Study accuracy answers must be complete.");
    if (answers.some((answer, answerIndex) => !ALLOWED_ANSWERS[answerIndex]!.has(answer))) throw new Error("Study answer is outside the frozen choice contract.");
    if (field("authentic_human_confirmation") !== "true") throw new Error("Study row lacks authentic-human confirmation.");
    const expected = DECISION_STUDY_ROLES[roleId as keyof typeof DECISION_STUDY_ROLES].answerKey;
    const correctness = [field("required_correct"), field("preferred_correct"), field("work_mode_correct"), field("biggest_gap_correct")];
    if (correctness.some((value) => value !== "true" && value !== "false")) throw new Error("Study correctness fields must be true or false.");
    const recomputed = [answers[0] === expected.requiredExperienceAnswer, answers[1] === expected.preferredExperienceAnswer, answers[2] === expected.workModeAnswer, answers[3] === expected.weakestQualificationAnswer];
    if (correctness.some((value, index) => (value === "true") !== recomputed[index])) throw new Error("Study answer-key correctness mismatch.");
    const referenceDecision = field("decision_reference");
    const decisionAligned = decision === expected.decision;
    if (referenceDecision !== expected.decision) throw new Error("Study reference decision mismatch.");
    if (field("decision_alignment") !== String(decisionAligned)) throw new Error("Study decision-alignment mismatch.");
    const assigned = DECISION_STUDY_ASSIGNMENTS[assignmentGroup as "GROUP_1" | "GROUP_2"].find((item) => item.condition === condition);
    if (!assigned || assigned.roleId !== roleId) throw new Error("Study role and condition do not match the assignment group.");
    humanRows.push({
      participantId,
      assignmentGroup: assignmentGroup as ImpactRow["assignmentGroup"],
      roleId: roleId as ImpactRow["roleId"],
      conditionOrder: conditionOrder as ImpactRow["conditionOrder"],
      condition: condition as StudyCondition,
      taskSeconds: numberInRange(field("task_seconds"), "task_seconds", 1, 7_200),
      requiredExperienceAnswer: answers[0]!,
      preferredExperienceAnswer: answers[1]!,
      workModeAnswer: answers[2]!,
      biggestGapAnswer: answers[3]!,
      requiredCorrect: recomputed[0]!,
      preferredCorrect: recomputed[1]!,
      workCorrect: recomputed[2]!,
      gapCorrect: recomputed[3]!,
      decisionAligned,
      referenceDecision: referenceDecision as Exclude<StudyDecision, "">,
      decision: decision as Exclude<StudyDecision, "">,
      confidence: numberInRange(field("confidence_1_to_7"), "confidence_1_to_7", 1, 7),
      transparency: numberInRange(field("clarity_1_to_7"), "clarity_1_to_7", 1, 7),
      consentVersion: field("consent_version"),
      completedAt,
    });
  }

  const grouped = new Map<string, ImpactRow[]>();
  for (const row of humanRows) grouped.set(row.participantId, [...(grouped.get(row.participantId) ?? []), row]);
  const pairs: Pair[] = [];
  for (const [participantId, rows] of grouped) {
    if (rows.length !== 2 || new Set(rows.map((row) => row.condition)).size !== 2) throw new Error(`Incomplete participant session: ${participantId}`);
    if (new Set(rows.map((row) => row.conditionOrder)).size !== 1) throw new Error(`Condition-order mismatch within participant session: ${participantId}`);
    if (new Set(rows.map((row) => row.roleId)).size !== 2) throw new Error(`Same-role carryover within participant session: ${participantId}`);
    if (new Set(rows.map((row) => row.assignmentGroup)).size !== 1) throw new Error(`Assignment mismatch within participant session: ${participantId}`);
    const raw = rows.find((row) => row.condition === "RAW_POSTING")!;
    const jobPilot = rows.find((row) => row.condition === "JOBPILOT")!;
    pairs.push({ participantId, RAW_POSTING: raw, JOBPILOT: jobPilot });
  }
  pairs.sort((left, right) => left.participantId.localeCompare(right.participantId));
  const participantCount = pairs.length;
  const status = studyCollectionState(participantCount);
  const raw = pairs.map((pair) => pair.RAW_POSTING);
  const jobPilot = pairs.map((pair) => pair.JOBPILOT);
  const paired = pairedMetrics(pairs);
  const iterations = options.bootstrapIterations ?? 5_000;
  const bootstrapAvailable = participantCount >= 5;
  return {
    schemaVersion: "jobpilot.bw9.impact-analysis.v1",
    status,
    humanParticipantCount: participantCount,
    humanRows: humanRows.length,
    syntheticToolingValidationRows,
    minimumParticipantTarget: 5,
    preferredParticipantTarget: DECISION_STUDY_PREFERRED_PARTICIPANTS,
    conditionOrderCounts: { RAW_POSTING_THEN_JOBPILOT: pairs.length },
    conditions: { RAW_POSTING: summarizeCondition(raw), JOBPILOT: summarizeCondition(jobPilot) },
    paired,
    bootstrapConfidenceIntervals: bootstrapAvailable ? bootstrapIntervals(pairs, iterations, options.bootstrapSeed ?? 2_026_071_8) : null,
    bootstrapStatus: participantCount === 0 ? "NOT_AVAILABLE_NO_PARTICIPANTS" : bootstrapAvailable ? "AVAILABLE" : "NOT_AVAILABLE_BELOW_MINIMUM",
    statisticalSignificanceClaim: false,
    inferenceBoundary: participantCount < 5 ? "Human results are withheld below the minimum target. No significance or population-level claim is permitted." : "Directional early-usability evidence only. Bootstrap intervals describe this small sample; no statistical-significance claim is made.",
    validation: { duplicateParticipantConditions: 0, incompleteParticipantSessions: 0, malformedRows: 0, prohibitedColumns: 0, fabricatedParticipants: 0 },
  };
}

export function publicImpactSummary(analysis: ImpactStudyAnalysis) {
  const publishMetrics = analysis.humanParticipantCount >= 5;
  return {
    schemaVersion: "jobpilot.bw9.public-impact-summary.v1",
    status: analysis.status,
    humanParticipantCount: analysis.humanParticipantCount,
    minimumParticipantTarget: analysis.minimumParticipantTarget,
    preferredParticipantTarget: analysis.preferredParticipantTarget,
    summary: analysis.humanParticipantCount === 0
      ? "Human sessions have not started. No usability result is claimed."
      : publishMetrics
        ? "Minimum collection is complete. Results are directional early-usability evidence, not a population or hiring-outcome claim."
        : "Collection is in progress. Metrics remain withheld until five complete actual participant sessions are imported.",
    metrics: publishMetrics ? {
      rawPostingMedianSeconds: analysis.conditions.RAW_POSTING.medianDecisionTimeSeconds,
      jobPilotMedianSeconds: analysis.conditions.JOBPILOT.medianDecisionTimeSeconds,
      pairedMedianTimeDifferenceSecondsJobPilotMinusRaw: analysis.paired.medianTimeDifferenceSecondsJobPilotMinusRaw,
      pairedMedianPercentageTimeChangeJobPilotVsRaw: analysis.paired.medianPercentageTimeChangeJobPilotVsRaw,
      requiredExperienceAccuracy: { rawPosting: analysis.conditions.RAW_POSTING.requiredExperienceAccuracyPercent, jobPilot: analysis.conditions.JOBPILOT.requiredExperienceAccuracyPercent },
      preferredExperienceAccuracy: { rawPosting: analysis.conditions.RAW_POSTING.preferredExperienceAccuracyPercent, jobPilot: analysis.conditions.JOBPILOT.preferredExperienceAccuracyPercent },
      workModeAccuracy: { rawPosting: analysis.conditions.RAW_POSTING.workModeAccuracyPercent, jobPilot: analysis.conditions.JOBPILOT.workModeAccuracyPercent },
      biggestGapAccuracy: { rawPosting: analysis.conditions.RAW_POSTING.biggestGapAccuracyPercent, jobPilot: analysis.conditions.JOBPILOT.biggestGapAccuracyPercent },
      decisionAgreementPercent: analysis.paired.decisionAgreementPercent,
      confidenceDifference: analysis.paired.meanConfidenceDifferenceJobPilotMinusRaw,
      transparencyDifference: analysis.paired.meanTransparencyDifferenceJobPilotMinusRaw,
      bootstrapConfidenceIntervals: analysis.bootstrapConfidenceIntervals,
    } : null,
    statisticalSignificanceClaim: false,
    fabricatedParticipants: 0,
  };
}
