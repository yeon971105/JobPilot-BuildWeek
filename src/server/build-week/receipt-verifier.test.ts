import { describe, expect, it } from "vitest";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { parseReceiptText, verifyReceipt } from "@/server/build-week/receipt-verifier";
import { scoreJob, sha256 } from "@/server/build-week/scorer";
import { readFileSync } from "node:fs";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function rehash(receipt: Record<string, unknown>) {
  const { receiptHash: _prior, ...body } = receipt;
  void _prior;
  receipt.receiptHash = sha256(body);
  return receipt;
}
function failed(receipt: unknown) { return verifyReceipt(receipt, "2026-07-18T07:00:00.000Z"); }

describe("independent score receipt verifier", () => {
  it("fully reproduces all six frozen receipts", () => {
    for (const job of DEMO_JOBS) {
      const result = failed(scoreJob(job).receipt);
      expect(result.status).toBe("FULLY_REPRODUCED");
      expect(result.failedChecks).toEqual([]);
      expect(result.sourceInputsAvailable).toBe(true);
      expect(result.externalRequests).toBe(0);
      expect(result.privateResumeRequired).toBe(false);
    }
  });

  it("rejects hash, arithmetic, cap, transfer, and evidence tampering", () => {
    const base = clone(scoreJob(DEMO_JOBS[0]!).receipt) as unknown as Record<string, unknown>;
    const hashTamper = clone(base); hashTamper.receiptHash = "0".repeat(64);
    expect(failed(hashTamper).failedChecks).toContain("canonical-hash");

    const arithmetic = clone(base); arithmetic.displayedScore = Number(arithmetic.displayedScore) + 1; rehash(arithmetic);
    expect(failed(arithmetic).failedChecks).toContain("displayed-score-rounding");

    const cap = clone(base); (cap.classTotals as Record<string, Record<string, unknown>>).preferred.maximumMicroPoints = 12_000_001; rehash(cap);
    expect(failed(cap).failedChecks).toContain("preferred-cap");

    const transfer = clone(base); (transfer.budgetTransfers as Record<string, unknown>).unusedPreferredToCoreMicroPoints = Number((transfer.budgetTransfers as Record<string, unknown>).unusedPreferredToCoreMicroPoints) + 1; rehash(transfer);
    expect(failed(transfer).failedChecks).toContain("budget-transfers");

    const evidence = clone(base); ((evidence.capabilityGroups as Array<Record<string, unknown>>)[0]!.candidateEvidenceIds as string[])[0] = "unknown-evidence"; rehash(evidence);
    expect(failed(evidence).failedChecks).toContain("known-evidence-ids");

    const duplicate = clone(base); const groups = duplicate.capabilityGroups as Array<Record<string, unknown>>; groups[1]!.id = groups[0]!.id; rehash(duplicate);
    expect(failed(duplicate).failedChecks).toContain("unique-requirement-ids");
  });

  it("distinguishes a valid receipt whose frozen source is unavailable", () => {
    const receipt = clone(scoreJob(DEMO_JOBS[0]!).receipt) as unknown as Record<string, unknown>;
    receipt.jobId = "external-source-job";
    receipt.candidateProfileId = "external-source-candidate";
    const result = failed(rehash(receipt));
    expect(result.status).toBe("ARITHMETICALLY_VALID");
    expect(result.failedChecks).toEqual([]);
    expect(result.sourceInputsAvailable).toBe(false);
  });

  it("rejects unsupported versions before interpreting their arithmetic", () => {
    const receipt = clone(scoreJob(DEMO_JOBS[0]!).receipt) as unknown as Record<string, unknown>;
    receipt.receiptVersion = "jobpilot.score-receipt.v99";
    const result = failed(rehash(receipt));
    expect(result.status).toBe("UNSUPPORTED_VERSION");
    expect(result.failedChecks).toEqual(["supported-version"]);
  });

  it("bounds bytes, depth, arrays, strings, object shape, and prototype keys", () => {
    expect(() => parseReceiptText("x".repeat(1_048_577))).toThrow("1 MB or smaller");
    const deep: Record<string, unknown> = {}; let cursor = deep; for (let index = 0; index < 16; index += 1) { cursor.next = {}; cursor = cursor.next as Record<string, unknown>; }
    expect(() => parseReceiptText(JSON.stringify(deep))).toThrow("nesting");
    expect(() => parseReceiptText(JSON.stringify({ values: Array.from({ length: 601 }, () => 1) }))).toThrow("oversized array");
    expect(() => parseReceiptText(JSON.stringify({ value: "x".repeat(12_001) }))).toThrow("oversized string");
    expect(() => parseReceiptText("[]")).toThrow("one object");
    expect(() => parseReceiptText('{"__proto__":{"polluted":true}}')).toThrow("forbidden object key");
  });

  it("keeps both verifier grid columns shrinkable at 320 pixels", () => {
    const source = readFileSync("src/components/demo/receipt-verifier.tsx", "utf8");
    expect(source).toContain('className="paper-card min-w-0"');
    expect(source).toContain('className="min-w-0" aria-live="polite"');
    expect(source).toContain('min-h-[360px] min-w-0');
  });
});
