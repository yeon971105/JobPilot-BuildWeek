import { parseRuntimeEnvironment } from "@/server/build-week/env";
import { parsePrivateResume, PrivateResumeError } from "@/server/private-profile/resume-parser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = parseRuntimeEnvironment();
  if (!config.LOCAL_PRIVATE_MODE) {
    return Response.json({ error: "LOCAL_PRIVATE_MODE_DISABLED", message: "Private resume analysis is available in the local JobPilot edition so your resume stays on your device." }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return Response.json({ error: "MISSING_FILE", message: "Select one PDF, DOCX, or TXT resume." }, { status: 400 });
    const result = await parsePrivateResume(file);
    return Response.json(result, { headers: { "Cache-Control": "no-store", "X-JobPilot-Privacy": "local-only-no-raw-persistence" } });
  } catch (error) {
    if (error instanceof PrivateResumeError) return Response.json({ error: error.code, message: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    return Response.json({ error: "RESUME_PARSE_FAILED", message: "The resume could not be processed safely." }, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
}
