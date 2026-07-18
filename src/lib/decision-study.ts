export const DECISION_STUDY_STORAGE_KEY = "jobpilot-decision-utility-study-v1";
export const DECISION_STUDY_SCHEMA_VERSION = "jobpilot.decision-utility-study.v1";
export type StudyCondition = "RAW_POSTING" | "JOBPILOT";
export type StudyDecision = "APPLY" | "REVIEW" | "SKIP" | "";

export type DecisionStudyAnswer = {
  requiredAnswer: string;
  preferredAnswer: string;
  workModeAnswer: string;
  biggestGapAnswer: string;
  decision: StudyDecision;
  confidence: number;
  transparency: number;
  taskSeconds: number | null;
  completed: boolean;
};

export type DecisionStudySession = {
  schemaVersion: typeof DECISION_STUDY_SCHEMA_VERSION;
  participantId: string;
  conditionOrder: [StudyCondition, StudyCondition];
  currentIndex: number;
  sessionStartedAt: string;
  conditionStartedAt: string;
  answers: Record<StudyCondition, DecisionStudyAnswer>;
  storageMode: "BROWSER_LOCAL_ONLY";
};

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
  return { requiredAnswer: "", preferredAnswer: "", workModeAnswer: "", biggestGapAnswer: "", decision: "", confidence: 4, transparency: 4, taskSeconds: null, completed: false };
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
    answers: { RAW_POSTING: emptyStudyAnswer(), JOBPILOT: emptyStudyAnswer() },
    storageMode: "BROWSER_LOCAL_ONLY",
  };
}

export function parseDecisionStudySession(raw: string | null): DecisionStudySession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as DecisionStudySession;
    const order = value.conditionOrder;
    if (value.schemaVersion !== DECISION_STUDY_SCHEMA_VERSION || !/^anon-[a-z0-9-]+$/.test(value.participantId)) return null;
    if (!Array.isArray(order) || order.length !== 2 || new Set(order).size !== 2 || !order.includes("RAW_POSTING") || !order.includes("JOBPILOT")) return null;
    if (!value.answers?.RAW_POSTING || !value.answers?.JOBPILOT || value.storageMode !== "BROWSER_LOCAL_ONLY") return null;
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
  "required_answer",
  "preferred_answer",
  "work_mode_answer",
  "biggest_gap_answer",
  "decision",
  "confidence_1_to_7",
  "transparency_1_to_7",
  "synthetic_tooling_validation",
] as const;

export function studySessionToCsv(session: DecisionStudySession) {
  const rows = session.conditionOrder.map((condition) => {
    const answer = session.answers[condition];
    return [session.participantId, session.conditionOrder.join("_THEN_"), condition, answer.taskSeconds, answer.requiredAnswer, answer.preferredAnswer, answer.workModeAnswer, answer.biggestGapAnswer, answer.decision, answer.confidence, answer.transparency, false].map(csvCell).join(",");
  });
  return [DECISION_STUDY_CSV_HEADERS.map(csvCell).join(","), ...rows].join("\n");
}
