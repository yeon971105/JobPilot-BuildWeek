import { parseReceiptText, RECEIPT_MAX_BYTES, verifyReceipt } from "@/server/build-week/receipt-verifier";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentType.startsWith("application/json")) return Response.json({ error: "JSON_REQUIRED", message: "Receipt verification accepts JSON only." }, { status: 415 });
  if (contentLength > RECEIPT_MAX_BYTES + 32_768) return Response.json({ error: "RECEIPT_TOO_LARGE", message: "Receipt JSON must be 1 MB or smaller." }, { status: 413 });
  try {
    const body = await request.json() as { receiptText?: unknown };
    if (typeof body.receiptText !== "string") return Response.json({ error: "INVALID_REQUEST", message: "Provide receiptText as a JSON string." }, { status: 400 });
    const receipt = parseReceiptText(body.receiptText);
    return Response.json({ verification: verifyReceipt(receipt) }, { headers: { "Cache-Control": "no-store", "X-JobPilot-Network": "local-verification-only" } });
  } catch (error) {
    return Response.json({ error: "INVALID_RECEIPT", message: error instanceof Error ? error.message : "Receipt verification failed safely." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
