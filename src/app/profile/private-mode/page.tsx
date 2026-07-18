import { PrivateModeGuide } from "@/components/profile/private-mode-guide";
import { parseRuntimeEnvironment } from "@/server/build-week/env";
export const dynamic = "force-dynamic";
export default function Page() { return <PrivateModeGuide enabled={parseRuntimeEnvironment().LOCAL_PRIVATE_MODE} />; }
