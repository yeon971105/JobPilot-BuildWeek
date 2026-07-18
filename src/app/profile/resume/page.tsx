import { ResumeOnboarding } from "@/components/profile/resume-onboarding";
import { parseRuntimeEnvironment } from "@/server/build-week/env";
export const dynamic = "force-dynamic";
export default function Page() { return <ResumeOnboarding enabled={parseRuntimeEnvironment().LOCAL_PRIVATE_MODE} />; }
