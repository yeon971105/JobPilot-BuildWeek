export const DECISION_STUDY_STORAGE_KEY = "jobpilot-decision-utility-study-v2";
export const DECISION_STUDY_SCHEMA_VERSION = "jobpilot.decision-utility-study.v2";
export const DECISION_STUDY_PROTOCOL_VERSION = "jobpilot-decision-utility.v2";
export const DECISION_STUDY_CONSENT_VERSION = "jobpilot-study-consent-v2";
export const DECISION_STUDY_MINIMUM_PARTICIPANTS = 5;
export const DECISION_STUDY_PREFERRED_PARTICIPANTS = "8–12";

export type StudyMode = "PREVIEW" | "PILOT" | "FINAL";
export type StudyCondition = "RAW_POSTING" | "JOBPILOT";
export type StudyDecision = "APPLY" | "REVIEW_FURTHER" | "SKIP" | "";
export type StudyAssignment = "GROUP_1" | "GROUP_2";
export type StudyCollectionState = "READY_NOT_RUN" | "IN_PROGRESS" | "COMPLETE_MINIMUM" | "COMPLETE_PREFERRED";
export type StudyExclusionStatus = "EXCLUDED_PREVIEW" | "EXCLUDED_PILOT" | "EXCLUDED_BROWSER_TEST" | "ELIGIBLE_FINAL_PENDING_VALIDATION";
export type StudyQuestionKey = "requiredExperienceAnswer" | "preferredExperienceAnswer" | "workModeAnswer" | "weakestQualificationAnswer" | "decision";

export type DecisionStudyRole = {
  id: "role-a-analytics-operations-engineer" | "role-b-data-enablement-engineer";
  title: string;
  company: string;
  location: string;
  workArrangement: string;
  summary: string;
  requiredExperience: string;
  preferredExperience: string;
  responsibilities: string[];
  candidateEvidence: string[];
  weakestQualification: string;
  recommendation: "APPLY" | "REVIEW_FURTHER" | "SKIP";
  strongestEvidence: string;
  answerKey: Record<StudyQuestionKey, string>;
};

export const DECISION_STUDY_ROLES: Record<DecisionStudyRole["id"], DecisionStudyRole> = {
  "role-a-analytics-operations-engineer": {
    id: "role-a-analytics-operations-engineer",
    title: "Analytics Operations Engineer",
    company: "Cedar Metrics",
    location: "Oakland, California",
    workArrangement: "Hybrid: two office days each week",
    summary: "Improve the reliability of shared analytics workflows and help product teams trust the data they use for decisions.",
    requiredExperience: "Three years operating analytics or data workflows",
    preferredExperience: "Experience with workflow orchestration tools",
    responsibilities: ["Maintain tested SQL and Python data workflows.", "Investigate data-quality incidents with product partners.", "Document reliable operating procedures."],
    candidateEvidence: ["Three and a half years maintaining SQL and Python services.", "Led data-quality incident reviews with product teams.", "No verified workflow-orchestration tool ownership is shown."],
    weakestQualification: "Workflow orchestration tools",
    recommendation: "REVIEW_FURTHER",
    strongestEvidence: "Direct SQL, Python, and incident-review evidence",
    answerKey: { requiredExperienceAnswer: "THREE_YEARS_ANALYTICS_OPERATIONS", preferredExperienceAnswer: "WORKFLOW_ORCHESTRATION", workModeAnswer: "HYBRID_TWO_DAYS", weakestQualificationAnswer: "WORKFLOW_ORCHESTRATION", decision: "REVIEW_FURTHER" },
  },
  "role-b-data-enablement-engineer": {
    id: "role-b-data-enablement-engineer",
    title: "Data Enablement Engineer",
    company: "Lumen Works",
    location: "Remote within California",
    workArrangement: "Remote",
    summary: "Build reusable data tools and help internal teams adopt reliable self-service reporting practices.",
    requiredExperience: "Four years delivering data products or internal platforms",
    preferredExperience: "Experience designing technical training programs",
    responsibilities: ["Build reusable Python and SQL enablement tools.", "Partner with analysts on trustworthy metric definitions.", "Create practical adoption guidance."],
    candidateEvidence: ["Four years delivering internal data products.", "Strong Python, SQL, and analyst-partnership evidence.", "Created documentation, but no verified training-program ownership is shown."],
    weakestQualification: "Technical training program design",
    recommendation: "APPLY",
    strongestEvidence: "Direct data-product, Python, SQL, and partnership evidence",
    answerKey: { requiredExperienceAnswer: "FOUR_YEARS_DATA_PRODUCTS", preferredExperienceAnswer: "TRAINING_PROGRAM_DESIGN", workModeAnswer: "REMOTE", weakestQualificationAnswer: "TRAINING_PROGRAM_DESIGN", decision: "APPLY" },
  },
};

export const REQUIRED_EXPERIENCE_CHOICES = [
  ["THREE_YEARS_ANALYTICS_OPERATIONS", "Three years operating analytics or data workflows"],
  ["FOUR_YEARS_DATA_PRODUCTS", "Four years delivering data products or internal platforms"],
  ["TWO_YEARS_SOFTWARE", "Two years of general software development"],
  ["NO_REQUIRED_EXPERIENCE", "No experience requirement is stated"],
] as const;
export const PREFERRED_EXPERIENCE_CHOICES = [
  ["WORKFLOW_ORCHESTRATION", "Experience with workflow orchestration tools"],
  ["TRAINING_PROGRAM_DESIGN", "Experience designing technical training programs"],
  ["CLOUD_CERTIFICATION", "A cloud certification"],
  ["NO_PREFERRED_EXPERIENCE", "No preferred experience is stated"],
] as const;
export const WORK_MODE_CHOICES = [["HYBRID_TWO_DAYS", "Hybrid: two office days each week"], ["REMOTE", "Remote"], ["ONSITE", "Onsite"], ["UNCLEAR", "Not stated clearly"]] as const;
export const BIGGEST_GAP_CHOICES = [["WORKFLOW_ORCHESTRATION", "Workflow orchestration tools"], ["TRAINING_PROGRAM_DESIGN", "Technical training program design"], ["PYTHON_SQL", "Python and SQL"], ["PRODUCT_PARTNERSHIP", "Product and analyst partnership"]] as const;
export const DECISION_CHOICES = [["APPLY", "Apply"], ["REVIEW_FURTHER", "Review Further"], ["SKIP", "Skip"]] as const;

export type DecisionStudyResponse = {
  roleId: DecisionStudyRole["id"];
  condition: StudyCondition;
  requiredExperienceAnswer: string;
  preferredExperienceAnswer: string;
  workModeAnswer: string;
  weakestQualificationAnswer: string;
  decision: StudyDecision;
  correctness: Record<StudyQuestionKey, boolean | null>;
  confidence: number;
  clarity: number;
  taskSeconds: number | null;
  completed: boolean;
  completedAt: string | null;
};

export type DecisionStudySession = {
  schemaVersion: typeof DECISION_STUDY_SCHEMA_VERSION;
  protocolVersion: typeof DECISION_STUDY_PROTOCOL_VERSION;
  participantId: string;
  phase: StudyMode;
  assignmentGroup: StudyAssignment;
  screen: number;
  currentConditionIndex: number;
  sessionStartedAt: string;
  conditionStartedAt: string;
  consent: { version: typeof DECISION_STUDY_CONSENT_VERSION; acceptedAt: string; authenticHumanConfirmation: boolean };
  comprehensionPassed: boolean;
  responses: [DecisionStudyResponse, DecisionStudyResponse];
  storageMode: "BROWSER_LOCAL_ONLY";
};

export const DECISION_STUDY_ASSIGNMENTS: Record<StudyAssignment, readonly [{ roleId: DecisionStudyRole["id"]; condition: StudyCondition }, { roleId: DecisionStudyRole["id"]; condition: StudyCondition }]> = {
  GROUP_1: [{ roleId: "role-a-analytics-operations-engineer", condition: "RAW_POSTING" }, { roleId: "role-b-data-enablement-engineer", condition: "JOBPILOT" }],
  GROUP_2: [{ roleId: "role-b-data-enablement-engineer", condition: "RAW_POSTING" }, { roleId: "role-a-analytics-operations-engineer", condition: "JOBPILOT" }],
};

export function studyCollectionState(participantCount: number): StudyCollectionState {
  if (!Number.isSafeInteger(participantCount) || participantCount < 0) throw new Error("Participant count must be a non-negative integer.");
  if (participantCount === 0) return "READY_NOT_RUN";
  if (participantCount < DECISION_STUDY_MINIMUM_PARTICIPANTS) return "IN_PROGRESS";
  if (participantCount < 8) return "COMPLETE_MINIMUM";
  return "COMPLETE_PREFERRED";
}

export function randomizedAssignment(randomValue = Math.random()): StudyAssignment {
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) throw new Error("Randomization value must be in [0, 1).");
  return randomValue < 0.5 ? "GROUP_1" : "GROUP_2";
}

export function randomizedConditionOrder(randomValue = Math.random()): [StudyCondition, StudyCondition] {
  randomizedAssignment(randomValue);
  return ["RAW_POSTING", "JOBPILOT"];
}

export function anonymousParticipantId(entropy?: Uint32Array) {
  const values = entropy ?? globalThis.crypto.getRandomValues(new Uint32Array(3));
  if (values.length < 3) throw new Error("Anonymous participant entropy is incomplete.");
  return `anon-${[...values.slice(0, 3)].map((value) => value.toString(36).padStart(7, "0")).join("-")}`;
}

function emptyResponse(roleId: DecisionStudyRole["id"], condition: StudyCondition): DecisionStudyResponse {
  return { roleId, condition, requiredExperienceAnswer: "", preferredExperienceAnswer: "", workModeAnswer: "", weakestQualificationAnswer: "", decision: "", correctness: { requiredExperienceAnswer: null, preferredExperienceAnswer: null, workModeAnswer: null, weakestQualificationAnswer: null, decision: null }, confidence: 0, clarity: 0, taskSeconds: null, completed: false, completedAt: null };
}

export function createDecisionStudySession(options: { randomValue?: number; participantEntropy?: Uint32Array; now?: Date; phase?: StudyMode; authenticHumanConfirmation?: boolean } = {}): DecisionStudySession {
  const now = (options.now ?? new Date()).toISOString();
  const assignmentGroup = randomizedAssignment(options.randomValue ?? Math.random());
  const assignment = DECISION_STUDY_ASSIGNMENTS[assignmentGroup];
  return { schemaVersion: DECISION_STUDY_SCHEMA_VERSION, protocolVersion: DECISION_STUDY_PROTOCOL_VERSION, participantId: anonymousParticipantId(options.participantEntropy), phase: options.phase ?? "FINAL", assignmentGroup, screen: 2, currentConditionIndex: 0, sessionStartedAt: now, conditionStartedAt: now, consent: { version: DECISION_STUDY_CONSENT_VERSION, acceptedAt: now, authenticHumanConfirmation: options.authenticHumanConfirmation ?? false }, comprehensionPassed: false, responses: [emptyResponse(assignment[0].roleId, assignment[0].condition), emptyResponse(assignment[1].roleId, assignment[1].condition)], storageMode: "BROWSER_LOCAL_ONLY" };
}

export function scoreStudyResponse(response: DecisionStudyResponse) {
  const key = DECISION_STUDY_ROLES[response.roleId].answerKey;
  return { requiredExperienceAnswer: response.requiredExperienceAnswer === key.requiredExperienceAnswer, preferredExperienceAnswer: response.preferredExperienceAnswer === key.preferredExperienceAnswer, workModeAnswer: response.workModeAnswer === key.workModeAnswer, weakestQualificationAnswer: response.weakestQualificationAnswer === key.weakestQualificationAnswer, decision: response.decision === key.decision };
}

function isIso(value: unknown) { return typeof value === "string" && Number.isFinite(Date.parse(value)); }
export function parseDecisionStudySession(raw: string | null): DecisionStudySession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as DecisionStudySession;
    if (value.schemaVersion !== DECISION_STUDY_SCHEMA_VERSION || value.protocolVersion !== DECISION_STUDY_PROTOCOL_VERSION || !/^anon-[a-z0-9-]+$/.test(value.participantId)) return null;
    if (!(["PREVIEW", "PILOT", "FINAL"] as string[]).includes(value.phase) || !DECISION_STUDY_ASSIGNMENTS[value.assignmentGroup]) return null;
    const assignment = DECISION_STUDY_ASSIGNMENTS[value.assignmentGroup];
    if (!Array.isArray(value.responses) || value.responses.length !== 2 || new Set(value.responses.map((item) => item.roleId)).size !== 2) return null;
    if (value.responses.some((item, index) => item.roleId !== assignment[index].roleId || item.condition !== assignment[index].condition)) return null;
    if (value.consent?.version !== DECISION_STUDY_CONSENT_VERSION || !isIso(value.consent.acceptedAt) || value.storageMode !== "BROWSER_LOCAL_ONLY") return null;
    if (!Number.isInteger(value.screen) || value.screen < 2 || value.screen > 19 || !Number.isInteger(value.currentConditionIndex) || value.currentConditionIndex < 0 || value.currentConditionIndex > 2) return null;
    return value;
  } catch { return null; }
}

function csvCell(value: string | number | boolean | null) { const text = value === null ? "" : String(value); return `"${text.replaceAll('"', '""')}"`; }
export const DECISION_STUDY_CSV_HEADERS = ["participant_id", "protocol_version", "consent_version", "phase", "exclusion_status", "assignment_group", "condition_order", "role_id", "condition", "task_seconds", "required_experience_answer", "preferred_experience_answer", "work_mode_answer", "biggest_gap_answer", "decision", "required_correct", "preferred_correct", "work_mode_correct", "biggest_gap_correct", "decision_correct", "confidence_1_to_7", "clarity_1_to_7", "completed_at", "authentic_human_confirmation", "synthetic_tooling_validation"] as const;

export function studyExclusionStatus(session: DecisionStudySession): StudyExclusionStatus {
  if (session.phase === "PREVIEW") return "EXCLUDED_PREVIEW";
  if (session.phase === "PILOT") return "EXCLUDED_PILOT";
  if (!session.consent.authenticHumanConfirmation) return "EXCLUDED_BROWSER_TEST";
  return "ELIGIBLE_FINAL_PENDING_VALIDATION";
}

export function studyExportBaseName(session: DecisionStudySession) {
  const phase = session.phase === "PREVIEW" ? "preview" : session.phase === "PILOT" ? "pilot" : "final";
  return `jobpilot-study-${phase}-${session.participantId}`;
}

export function studySessionToJson(session: DecisionStudySession) {
  return JSON.stringify({
    exportSchemaVersion: "jobpilot.decision-utility-export.v1",
    studyPhase: session.phase,
    exclusionStatus: studyExclusionStatus(session),
    protocolVersion: session.protocolVersion,
    consentVersion: session.consent.version,
    anonymousId: session.participantId,
    assignmentGroup: session.assignmentGroup,
    roleIds: session.responses.map((response) => response.roleId),
    conditionResults: session.responses,
    authenticHumanConfirmation: session.consent.authenticHumanConfirmation,
    syntheticToolingValidation: session.phase !== "FINAL" || !session.consent.authenticHumanConfirmation,
    storageMode: session.storageMode,
    piiFields: [],
  }, null, 2);
}

export function studySessionToCsv(session: DecisionStudySession) {
  const exclusionStatus = studyExclusionStatus(session);
  const syntheticToolingValidation = session.phase !== "FINAL" || !session.consent.authenticHumanConfirmation;
  const rows = session.responses.map((response) => {
    const correctness = scoreStudyResponse(response);
    return [session.participantId, session.protocolVersion, session.consent.version, session.phase, exclusionStatus, session.assignmentGroup, "RAW_POSTING_THEN_JOBPILOT", response.roleId, response.condition, response.taskSeconds, response.requiredExperienceAnswer, response.preferredExperienceAnswer, response.workModeAnswer, response.weakestQualificationAnswer, response.decision, correctness.requiredExperienceAnswer, correctness.preferredExperienceAnswer, correctness.workModeAnswer, correctness.weakestQualificationAnswer, correctness.decision, response.confidence, response.clarity, response.completedAt, session.consent.authenticHumanConfirmation, syntheticToolingValidation].map(csvCell).join(",");
  });
  return [DECISION_STUDY_CSV_HEADERS.map(csvCell).join(","), ...rows].join("\n");
}
