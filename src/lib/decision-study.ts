export const DECISION_STUDY_STORAGE_KEY = "jobpilot-decision-utility-study-v2";
export const DECISION_STUDY_SCHEMA_VERSION = "jobpilot.decision-utility-study.v2";
export const DECISION_STUDY_CONSENT_VERSION = "jobpilot-study-consent-v1";
export const DECISION_STUDY_MINIMUM_PARTICIPANTS = 5;
export const DECISION_STUDY_PREFERRED_PARTICIPANTS = "8–12";

export type StudyCondition = "RAW_POSTING" | "JOBPILOT";
export type StudyDecision = "APPLY" | "REVIEW" | "SKIP" | "";
export type StudyCollectionState = "READY_NOT_RUN" | "IN_PROGRESS" | "COMPLETE";

export const REQUIRED_EXPERIENCE_CHOICES = [
  ["", "Choose one"],
  ["NO_NUMERIC_REQUIRED_EXPERIENCE", "No numeric required experience is stated"],
  ["THREE_YEARS_RELEVANT_DELIVERY", "Three years of relevant delivery experience"],
  ["FIVE_YEARS_APPLIED_AI", "Five years of applied AI experience"],
  ["UNCLEAR", "Unclear"],
] as const;

export const PREFERRED_EXPERIENCE_CHOICES = [
  ["", "Choose one"],
  ["THREE_YEARS_RELEVANT_DELIVERY", "Three years of relevant delivery experience"],
  ["NO_NUMERIC_PREFERRED_EXPERIENCE", "No numeric preferred experience is stated"],
  ["FIVE_YEARS_APPLIED_AI", "Five years of applied AI experience"],
  ["UNCLEAR", "Unclear"],
] as const;

export const WORK_MODE_CHOICES = [
  ["", "Choose one"],
  ["HYBRID_AND_REMOTE", "Hybrid and Remote"],
  ["REMOTE_ONLY", "Remote only"],
  ["HYBRID_ONLY", "Hybrid only"],
  ["ONSITE_ONLY", "Onsite only"],
  ["UNCLEAR", "Unclear"],
] as const;

export const BIGGEST_GAP_CHOICES = [
  ["", "Choose one"],
  ["APPLIED_AI_WORKFLOW_DELIVERY", "Applied AI workflow delivery"],
  ["MODERN_PYTHON_ENGINEERING", "Modern Python engineering"],
  ["CUSTOMER_TECHNICAL_DISCOVERY", "Customer technical discovery"],
  ["VECTOR_AND_EMBEDDING_TOOLING", "Vector and embedding tooling"],
  ["UNCLEAR", "Unclear"],
] as const;

export type DecisionStudyAnswer = {
  requiredExperienceAnswer: string;
  preferredExperienceAnswer: string;
  workModeAnswer: string;
  biggestGapAnswer: string;
  decision: StudyDecision;
  confidence: number;
  transparency: number;
  taskSeconds: number | null;
  completed: boolean;
  completedAt: string | null;
};

export type DecisionStudySession = {
  schemaVersion: typeof DECISION_STUDY_SCHEMA_VERSION;
  participantId: string;
  conditionOrder: [StudyCondition, StudyCondition];
  currentIndex: number;
  sessionStartedAt: string;
  conditionStartedAt: string;
  consent: { version: typeof DECISION_STUDY_CONSENT_VERSION; acceptedAt: string };
  answers: Record<StudyCondition, DecisionStudyAnswer>;
  storageMode: "BROWSER_LOCAL_ONLY";
};

export function studyCollectionState(participantCount: number): StudyCollectionState {
  if (!Number.isSafeInteger(participantCount) || participantCount < 0) throw new Error("Participant count must be a non-negative integer.");
  if (participantCount === 0) return "READY_NOT_RUN";
  if (participantCount < DECISION_STUDY_MINIMUM_PARTICIPANTS) return "IN_PROGRESS";
  return "COMPLETE";
}

export function randomizedConditionOrder(randomValue = Math.random()): [StudyCondition, StudyCondition] {
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) throw new Error("Randomization value must be in [0, 1)." );
  return randomValue < 0.5 ? ["RAW_POSTING", "JOBPILOT"] : ["JOBPILOT", "RAW_POSTING"];
}

export function anonymousParticipantId(entropy?: Uint32Array) {
  const values = entropy ?? globalThis.crypto.getRandomValues(new Uint32Array(3));
  if (values.length < 3) throw new Error("Anonymous participant entropy is incomplete.");
  return `anon-${[...values.slice(0, 3)].map((value) => value.toString(36).padStart(7, "0")).join("-")}`;
}

export function emptyStudyAnswer(): DecisionStudyAnswer {
  return { requiredExperienceAnswer: "", preferredExperienceAnswer: "", workModeAnswer: "", biggestGapAnswer: "", decision: "", confidence: 4, transparency: 4, taskSeconds: null, completed: false, completedAt: null };
}

export function createDecisionStudySession(options: { randomValue?: number; participantEntropy?: Uint32Array; now?: Date } = {}): DecisionStudySession {
  const now = (options.now ?? new Date()).toISOString();
  return {
    schemaVersion: DECISION_STUDY_SCHEMA_VERSION,
    participantId: anonymousParticipantId(options.participantEntropy),
    conditionOrder: randomizedConditionOrder(options.randomValue ?? Math.random()),
    currentIndex: 0,
    sessionStartedAt: now,
    conditionStartedAt: now,
    consent: { version: DECISION_STUDY_CONSENT_VERSION, acceptedAt: now },
    answers: { RAW_POSTING: emptyStudyAnswer(), JOBPILOT: emptyStudyAnswer() },
    storageMode: "BROWSER_LOCAL_ONLY",
  };
}

function isIsoTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validAnswer(value: DecisionStudyAnswer | undefined) {
  return Boolean(value)
    && typeof value?.requiredExperienceAnswer === "string"
    && typeof value?.preferredExperienceAnswer === "string"
    && typeof value?.workModeAnswer === "string"
    && typeof value?.biggestGapAnswer === "string"
    && ["", "APPLY", "REVIEW", "SKIP"].includes(value?.decision ?? "")
    && Number.isInteger(value?.confidence) && value!.confidence >= 1 && value!.confidence <= 7
    && Number.isInteger(value?.transparency) && value!.transparency >= 1 && value!.transparency <= 7
    && (value?.taskSeconds === null || (Number.isInteger(value?.taskSeconds) && value!.taskSeconds! >= 0))
    && typeof value?.completed === "boolean"
    && (value?.completedAt === null || isIsoTimestamp(value?.completedAt));
}

export function parseDecisionStudySession(raw: string | null): DecisionStudySession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as DecisionStudySession;
    const order = value.conditionOrder;
    if (value.schemaVersion !== DECISION_STUDY_SCHEMA_VERSION || !/^anon-[a-z0-9-]+$/.test(value.participantId)) return null;
    if (!Array.isArray(order) || order.length !== 2 || new Set(order).size !== 2 || !order.includes("RAW_POSTING") || !order.includes("JOBPILOT")) return null;
    if (!Number.isInteger(value.currentIndex) || value.currentIndex < 0 || value.currentIndex > 2) return null;
    if (!isIsoTimestamp(value.sessionStartedAt) || !isIsoTimestamp(value.conditionStartedAt)) return null;
    if (value.consent?.version !== DECISION_STUDY_CONSENT_VERSION || !isIsoTimestamp(value.consent.acceptedAt)) return null;
    if (!validAnswer(value.answers?.RAW_POSTING) || !validAnswer(value.answers?.JOBPILOT) || value.storageMode !== "BROWSER_LOCAL_ONLY") return null;
    if (value.currentIndex === 2 && (!value.answers.RAW_POSTING.completed || !value.answers.JOBPILOT.completed)) return null;
    return value;
  } catch {
    return null;
  }
}

function csvCell(value: string | number | boolean | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export const DECISION_STUDY_CSV_HEADERS = [
  "participant_id",
  "condition_order",
  "condition",
  "task_seconds",
  "required_experience_answer",
  "preferred_experience_answer",
  "work_mode_answer",
  "biggest_gap_answer",
  "decision",
  "confidence_1_to_7",
  "transparency_1_to_7",
  "consent_version",
  "completed_at",
  "synthetic_tooling_validation",
] as const;

export function studySessionToCsv(session: DecisionStudySession) {
  const rows = session.conditionOrder.map((condition) => {
    const answer = session.answers[condition];
    return [session.participantId, session.conditionOrder.join("_THEN_"), condition, answer.taskSeconds, answer.requiredExperienceAnswer, answer.preferredExperienceAnswer, answer.workModeAnswer, answer.biggestGapAnswer, answer.decision, answer.confidence, answer.transparency, session.consent.version, answer.completedAt, false].map(csvCell).join(",");
  });
  return [DECISION_STUDY_CSV_HEADERS.map(csvCell).join(","), ...rows].join("\n");
}
