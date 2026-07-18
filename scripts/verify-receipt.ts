import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseReceiptText, verifyReceipt } from "../src/server/build-week/receipt-verifier";

const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run verify:receipt -- <receipt-path>");
  process.exitCode = 2;
} else {
  try {
    const receipt = parseReceiptText(readFileSync(resolve(path), "utf8"));
    const verification = verifyReceipt(receipt);
    console.log(JSON.stringify(verification, null, 2));
    if (verification.status === "INVALID" || verification.status === "UNSUPPORTED_VERSION") process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ verifierVersion: "jobpilot-receipt-verifier.v1", status: "INVALID", message: error instanceof Error ? error.message : "Receipt verification failed safely." }, null, 2));
    process.exitCode = 1;
  }
}
