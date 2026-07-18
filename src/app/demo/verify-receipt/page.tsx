import { ReceiptVerifierPage } from "@/components/demo/receipt-verifier";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { scoreJob } from "@/server/build-week/scorer";
import { verifyReceipt } from "@/server/build-week/receipt-verifier";

export default function Page() {
  const receipt = scoreJob(DEMO_JOBS[0]!).receipt;
  return <ReceiptVerifierPage bundledReceipt={receipt} bundledVerification={verifyReceipt(receipt, "2026-07-18T00:00:00.000Z")} />;
}
