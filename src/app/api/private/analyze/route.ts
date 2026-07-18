import { z } from "zod";
import { analyzePrivateProfile } from "@/server/private-profile/local-analysis";

export const runtime = "nodejs";

const profileSchema = z.object({
  id: z.string().max(80), label: z.literal("Private Local Resume"), source: z.literal("PRIVATE_LOCAL_RESUME"), format: z.enum(["PDF", "DOCX", "TXT"]), contentHash: z.string().regex(/^[a-f0-9]{64}$/), processedAt: z.string(), confirmedAt: z.string().nullable(), completeness: z.number().min(0).max(100), warnings: z.array(z.string().max(240)).max(12),
  roleHistory: z.array(z.object({ id: z.string(), title: z.string().max(160), organization: z.string().max(160), startMonth: z.string().max(20), endMonth: z.string().max(20), summary: z.string().max(480) }).strict()).max(20),
  projects: z.array(z.object({ id: z.string(), name: z.string().max(160), summary: z.string().max(480) }).strict()).max(20),
  skills: z.array(z.string().max(120)).max(80), education: z.array(z.string().max(200)).max(20), certifications: z.array(z.string().max(200)).max(20),
  evidence: z.array(z.object({ id: z.string(), label: z.string().max(160), text: z.string().max(320), capabilities: z.array(z.string().max(120)).max(12) }).strict()).max(30),
}).strict();
const preferencesSchema = z.object({ acceptedWorkModes: z.array(z.enum(["REMOTE", "HYBRID", "ONSITE"])).max(3), preferredLocations: z.array(z.string().max(100)).max(12), remoteEligibility: z.enum(["YES", "NO", "NEEDS_CLARIFICATION"]), maximumTravelPercent: z.number().min(0).max(100).nullable(), willingToRelocate: z.boolean(), authorizationNote: z.string().max(240) }).strict();
const requestSchema = z.object({ jobId: z.string().max(120), profile: profileSchema, preferences: preferencesSchema }).strict();

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    if (!input.profile.confirmedAt) return Response.json({ error: "PROFILE_NOT_CONFIRMED", message: "Confirm the extracted profile before local analysis." }, { status: 409 });
    const result = await analyzePrivateProfile(input.jobId, input.profile, input.preferences);
    return Response.json(result, { headers: { "Cache-Control": "no-store", "X-JobPilot-Privacy": "local-gemma-no-cloud" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "INVALID_PRIVATE_PROFILE", message: "The local profile data did not pass validation." }, { status: 400 });
    const message = error instanceof Error && /disabled|unavailable|fetch|timeout|HTTP/.test(error.message) ? "Local Gemma is unavailable. Confirm that Ollama, gemma4:12b, OLLAMA_ENABLED=true, and LOCAL_PRIVATE_MODE=true are configured." : "Private local analysis could not be completed safely.";
    return Response.json({ error: "LOCAL_ANALYSIS_FAILED", message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
