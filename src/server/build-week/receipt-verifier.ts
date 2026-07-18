import { DEMO_CANDIDATE, getDemoJob } from "@/lib/demo-contract";
import { RECEIPT_VERSION, scoreJob, sha256, stableStringify } from "@/server/build-week/scorer";

export const RECEIPT_MAX_BYTES = 1_048_576;
const MAX_DEPTH = 14;
const MAX_ARRAY_LENGTH = 600;
const MAX_STRING_LENGTH = 12_000;
const MAX_NODES = 25_000;
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export type ReceiptVerificationStatus = "FULLY_REPRODUCED" | "ARITHMETICALLY_VALID" | "INVALID" | "UNSUPPORTED_VERSION";
export type ReceiptCheck = { id: string; passed: boolean; message: string };
export type ReceiptVerification = {
  verifierVersion: "jobpilot-receipt-verifier.v1";
  status: ReceiptVerificationStatus;
  receiptVersion: string | null;
  receiptHash: string | null;
  jobId: string | null;
  checks: ReceiptCheck[];
  failedChecks: string[];
  sourceInputsAvailable: boolean;
  externalRequests: 0;
  privateResumeRequired: false;
  verifiedAt: string;
};

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const asNumber = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) ? value : null;
const asString = (value: unknown) => typeof value === "string" ? value : null;

function check(checks: ReceiptCheck[], id: string, passed: boolean, passMessage: string, failMessage: string) {
  checks.push({ id, passed, message: passed ? passMessage : failMessage });
}

function assertBounded(value: unknown) {
  let nodes = 0;
  const walk = (item: unknown, depth: number) => {
    nodes += 1;
    if (nodes > MAX_NODES) throw new Error("Receipt contains too many values.");
    if (depth > MAX_DEPTH) throw new Error("Receipt nesting exceeds the supported depth.");
    if (typeof item === "string" && item.length > MAX_STRING_LENGTH) throw new Error("Receipt contains an oversized string.");
    if (Array.isArray(item)) {
      if (item.length > MAX_ARRAY_LENGTH) throw new Error("Receipt contains an oversized array.");
      item.forEach((child) => walk(child, depth + 1));
    } else if (isRecord(item)) {
      for (const [key, child] of Object.entries(item)) {
        if (FORBIDDEN_KEYS.has(key)) throw new Error("Receipt contains a forbidden object key.");
        if (key.length > 160) throw new Error("Receipt contains an oversized key.");
        walk(child, depth + 1);
      }
    }
  };
  walk(value, 0);
}

export function parseReceiptText(text: string) {
  if (Buffer.byteLength(text, "utf8") > RECEIPT_MAX_BYTES) throw new Error("Receipt JSON must be 1 MB or smaller.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("Receipt input is not valid JSON."); }
  assertBounded(value);
  if (!isRecord(value)) throw new Error("Receipt JSON must contain one object.");
  return value;
}

function classTotal(record: RecordValue, name: "core" | "preferred" | "niceToHave") {
  const value = record[name];
  return isRecord(value) ? value : null;
}

function integerField(record: RecordValue | null, key: string) { return record ? asNumber(record[key]) : null; }

export function verifyReceipt(receiptInput: unknown, verifiedAt = new Date().toISOString()): ReceiptVerification {
  const checks: ReceiptCheck[] = [];
  try { assertBounded(receiptInput); } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt input failed bounded validation.";
    return result("INVALID", null, null, null, [{ id: "bounded-input", passed: false, message }], false, verifiedAt);
  }
  if (!isRecord(receiptInput)) return result("INVALID", null, null, null, [{ id: "receipt-object", passed: false, message: "Receipt must be a JSON object." }], false, verifiedAt);
  const receipt = receiptInput;
  const receiptVersion = asString(receipt.receiptVersion);
  const receiptHash = asString(receipt.receiptHash);
  const jobId = asString(receipt.jobId);
  if (receiptVersion !== RECEIPT_VERSION) {
    check(checks, "supported-version", false, "", receiptVersion ? `Unsupported receipt version: ${receiptVersion}.` : "Receipt version is missing.");
    return result("UNSUPPORTED_VERSION", receiptVersion, receiptHash, jobId, checks, false, verifiedAt);
  }
  check(checks, "supported-version", true, `Receipt version ${RECEIPT_VERSION} is supported.`, "");
  check(checks, "receipt-hash-format", Boolean(receiptHash && /^[a-f0-9]{64}$/.test(receiptHash)), "Receipt hash has the expected SHA-256 format.", "Receipt hash is missing or malformed.");
  const { receiptHash: _providedHash, ...body } = receipt;
  void _providedHash;
  const reproducedHash = sha256(body);
  check(checks, "canonical-hash", receiptHash === reproducedHash, "Canonical serialization reproduces the receipt hash.", "Canonical serialization does not reproduce the receipt hash.");
  const analysisStatus = asString(receipt.analysisStatus);
  check(checks, "analysis-status", analysisStatus === "COMPLETE" || analysisStatus === "INSUFFICIENT_EVIDENCE", "Analysis status is valid.", "Analysis status is invalid.");
  check(checks, "scorer-version", receipt.scorerVersion === "jobpilot-ai-fit-v2.2", "Scorer version is supported.", "Scorer version is unsupported.");
  check(checks, "hidden-adjustments", receipt.hiddenAdjustments === 0, "Hidden adjustments equal zero.", "Hidden adjustments must equal zero.");
  const evidenceQuality = typeof receipt.evidenceQuality === "number" ? receipt.evidenceQuality : Number.NaN;
  check(checks, "evidence-quality", Number.isFinite(evidenceQuality) && evidenceQuality >= 0 && evidenceQuality <= 100, "Evidence Quality is in range.", "Evidence Quality must be between 0 and 100.");
  const numericEligible = receipt.numericScoreEligibility === true;
  const totals = isRecord(receipt.classTotals) ? receipt.classTotals : null;
  const core = totals ? classTotal(totals, "core") : null;
  const preferred = totals ? classTotal(totals, "preferred") : null;
  const nice = totals ? classTotal(totals, "niceToHave") : null;
  const capabilities = Array.isArray(receipt.capabilityGroups) && receipt.capabilityGroups.every(isRecord) ? receipt.capabilityGroups as RecordValue[] : null;
  check(checks, "class-totals-schema", Boolean(totals && core && preferred && nice), "Class totals are present.", "Class totals are missing or malformed.");
  check(checks, "capability-schema", Boolean(capabilities), "Capability groups are present.", "Capability groups are missing or malformed.");

  if (numericEligible && totals && core && preferred && nice && capabilities) {
    const totalMaximum = integerField(totals, "totalMaximumMicroPoints");
    check(checks, "total-maximum", totalMaximum === 100_000_000 && receipt.totalMaximumMicroPoints === totalMaximum, "Numeric analysis allocates exactly 100,000,000 micro-points.", "Numeric analysis must allocate exactly 100,000,000 micro-points.");
    for (const [name, classRecord] of [["core", core], ["preferred", preferred], ["niceToHave", nice]] as const) {
      const maximum = integerField(classRecord, "maximumMicroPoints");
      const low = integerField(classRecord, "earnedLowMicroPoints");
      const mid = integerField(classRecord, "earnedMidMicroPoints");
      const high = integerField(classRecord, "earnedHighMicroPoints");
      check(checks, `class-order-${name}`, maximum !== null && low !== null && mid !== null && high !== null && 0 <= low && low <= mid && mid <= high && high <= maximum, `${name} earnings reconcile low ≤ mid ≤ high ≤ maximum.`, `${name} earnings do not reconcile.`);
    }
    const classMaximumSum = [core, preferred, nice].reduce((sum, item) => sum + (integerField(item, "maximumMicroPoints") ?? Number.NaN), 0);
    check(checks, "class-maximum-sum", classMaximumSum === totalMaximum, "Class maximums reconcile to the total maximum.", "Class maximums do not reconcile to the total maximum.");
    for (const band of ["Low", "Mid", "High"] as const) {
      const classSum = [core, preferred, nice].reduce((sum, item) => sum + (integerField(item, `earned${band}MicroPoints`) ?? Number.NaN), 0);
      const total = integerField(totals, `totalEarned${band}MicroPoints`);
      check(checks, `class-earned-${band.toLowerCase()}`, classSum === total && receipt[`totalEarned${band}MicroPoints`] === total, `${band} earnings reconcile across classes and receipt totals.`, `${band} earnings do not reconcile.`);
    }
    const capabilityMaximum = capabilities.reduce((sum, item) => sum + (asNumber(item.maximumMicroPoints) ?? Number.NaN), 0);
    check(checks, "capability-maximum-sum", capabilityMaximum === totalMaximum, "Capability maximums reconcile to 100,000,000 micro-points.", "Capability maximums do not reconcile.");
    for (const band of ["Low", "Mid", "High"] as const) {
      const sum = capabilities.reduce((total, item) => total + (asNumber(item[`earned${band}MicroPoints`]) ?? Number.NaN), 0);
      check(checks, `capability-earned-${band.toLowerCase()}`, sum === integerField(totals, `totalEarned${band}MicroPoints`), `${band} capability earnings reconcile.`, `${band} capability earnings do not reconcile.`);
    }
    const preferredMaximum = integerField(preferred, "maximumMicroPoints");
    const preferredExperience = capabilities.filter((item) => item.scoringClass === "PREFERRED" && item.preferredCategory === "EXPERIENCE").reduce((sum, item) => sum + (asNumber(item.maximumMicroPoints) ?? Number.NaN), 0);
    const niceMaximum = integerField(nice, "maximumMicroPoints");
    check(checks, "preferred-cap", preferredMaximum !== null && preferredMaximum <= 12_000_000, "Preferred maximum is within 12,000,000 micro-points.", "Preferred maximum exceeds its cap.");
    check(checks, "preferred-experience-cap", preferredExperience <= 4_000_000, "Preferred Experience is within 4,000,000 micro-points.", "Preferred Experience exceeds its cap.");
    check(checks, "nice-cap", niceMaximum !== null && niceMaximum <= 3_000_000, "Nice-to-Have maximum is within 3,000,000 micro-points.", "Nice-to-Have maximum exceeds its cap.");
    check(checks, "single-nice-cap", capabilities.filter((item) => item.scoringClass === "NICE_TO_HAVE").every((item) => (asNumber(item.maximumMicroPoints) ?? Number.POSITIVE_INFINITY) <= 1_000_000), "Every Nice-to-Have group is at or below 1,000,000 micro-points.", "A Nice-to-Have group exceeds its cap.");
    const transfers = isRecord(receipt.budgetTransfers) ? receipt.budgetTransfers : null;
    const preferredTransfer = integerField(transfers, "unusedPreferredToCoreMicroPoints");
    const niceTransfer = integerField(transfers, "unusedNiceToCoreMicroPoints");
    check(checks, "budget-transfers", preferredMaximum !== null && niceMaximum !== null && preferredTransfer !== null && niceTransfer !== null && preferredMaximum + preferredTransfer === 12_000_000 && niceMaximum + niceTransfer === 3_000_000 && integerField(core, "maximumMicroPoints") === 85_000_000 + preferredTransfer + niceTransfer, "Preferred and Nice-to-Have transfers reconcile into Core.", "Budget transfers do not reconcile.");
    const midpoint = integerField(totals, "totalEarnedMidMicroPoints");
    check(checks, "displayed-score-rounding", midpoint !== null && receipt.displayedScore === Math.round(midpoint / 1_000_000), "Displayed score reproduces from midpoint rounding.", "Displayed score does not reproduce from midpoint rounding.");
    check(checks, "practical-separation", Array.isArray(receipt.practicalConstraints) && !capabilities.some((item) => "distanceMiles" in item || "workModeAdjustment" in item), "Practical constraints remain outside technical capability totals.", "Practical constraints appear to alter technical capability totals.");
  } else if (!numericEligible) {
    check(checks, "ineligible-score", receipt.displayedScore === null && Array.isArray(receipt.ineligibilityReasons) && receipt.ineligibilityReasons.length > 0, "Ineligible analysis has no numeric display and explains why.", "Ineligible analysis must omit the numeric score and explain why.");
  } else {
    check(checks, "numeric-schema", false, "", "Numeric analysis lacks required arithmetic structures.");
  }

  const knownJob = jobId ? getDemoJob(jobId) : null;
  const sourceCandidate = receipt.candidateProfileId === DEMO_CANDIDATE.id;
  if (knownJob) check(checks, "job-content-hash", receipt.jobContentHash === knownJob.contentHash, "Frozen job content hash reproduces.", "Frozen job content hash does not reproduce.");
  if (knownJob && sourceCandidate && capabilities) {
    const requirementIds = new Set(knownJob.requirements.map((item) => item.id));
    const candidateEvidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
    const ids = capabilities.map((item) => asString(item.id));
    check(checks, "unique-requirement-ids", ids.every(Boolean) && new Set(ids).size === ids.length, "Capability evidence IDs are unique.", "Capability evidence IDs are missing or duplicated.");
    check(checks, "known-evidence-ids", capabilities.every((item) => requirementIds.has(asString(item.id) ?? "") && Array.isArray(item.candidateEvidenceIds) && item.candidateEvidenceIds.every((id) => typeof id === "string" && candidateEvidenceIds.has(id))), "All capability and candidate evidence IDs exist in frozen source inputs.", "A capability or candidate evidence ID is invalid.");
  }
  const expected = knownJob && sourceCandidate ? scoreJob(knownJob).receipt : null;
  const fullyReproduced = Boolean(expected && stableStringify(expected) === stableStringify(receipt));
  if (expected) check(checks, "full-source-reproduction", fullyReproduced, "Frozen job, candidate, preferences, evidence, arithmetic, and receipt hash reproduce exactly.", "Frozen source inputs do not reproduce this receipt exactly.");
  const failed = checks.filter((item) => !item.passed);
  return result(failed.length ? "INVALID" : fullyReproduced ? "FULLY_REPRODUCED" : "ARITHMETICALLY_VALID", receiptVersion, receiptHash, jobId, checks, Boolean(expected), verifiedAt);
}

function result(status: ReceiptVerificationStatus, receiptVersion: string | null, receiptHash: string | null, jobId: string | null, checks: ReceiptCheck[], sourceInputsAvailable: boolean, verifiedAt: string): ReceiptVerification {
  return { verifierVersion: "jobpilot-receipt-verifier.v1", status, receiptVersion, receiptHash, jobId, checks, failedChecks: checks.filter((item) => !item.passed).map((item) => item.id), sourceInputsAvailable, externalRequests: 0, privateResumeRequired: false, verifiedAt };
}
