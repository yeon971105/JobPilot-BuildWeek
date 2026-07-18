import type { Metadata } from "next";
import { DecisionUtilityStudy } from "@/components/study/decision-utility-study";

export const metadata: Metadata = {
  title: "Decision Utility Study | JobPilot Research",
  description: "An isolated, fictional, local-only decision-utility study harness.",
};

export default function Page() { return <DecisionUtilityStudy />; }
