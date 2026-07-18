import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDemoJob } from "../src/lib/demo-contract";
import { scoreJob } from "../src/server/build-week/scorer";

const outputDirectory = resolve("build-week", "bw7", "receipts");
const outputPath = resolve(outputDirectory, "northstar-demo-receipt.json");
const job = getDemoJob("northstar-applied-ai-solutions-engineer");
if (!job) throw new Error("Frozen Northstar demo job is unavailable.");
const receipt = scoreJob(job).receipt;
const text = `${JSON.stringify(receipt, null, 2)}\n`;
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, text, "utf8");
console.log(JSON.stringify({ receiptPath: outputPath, receiptHash: receipt.receiptHash, fileSha256: createHash("sha256").update(text).digest("hex"), publicSafeSynthetic: true }, null, 2));
