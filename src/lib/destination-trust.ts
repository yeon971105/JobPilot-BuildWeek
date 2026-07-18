export const DESTINATION_TRUST_STATES = [
  "ORIGINAL_POSTING_RECORDED",
  "URL_REACHABLE",
  "APPLY_DESTINATION_VERIFIED",
  "VALIDATION_PENDING",
  "UNAVAILABLE",
] as const;

export type DestinationTrustState = (typeof DESTINATION_TRUST_STATES)[number];

export type DestinationTrustRecord = {
  jobId: string;
  state: DestinationTrustState;
  evidence: string;
  checkedAt: string | null;
};

const FROZEN_DESTINATIONS: Record<string, DestinationTrustRecord> = {
  "northstar-applied-ai-solutions-engineer": {
    jobId: "northstar-applied-ai-solutions-engineer",
    state: "APPLY_DESTINATION_VERIFIED",
    evidence: "Synthetic employer destination passed the complete Build Week handoff contract.",
    checkedAt: "2026-07-18T17:41:08.379Z",
  },
  "alder-data-platform-engineer": {
    jobId: "alder-data-platform-engineer",
    state: "URL_REACHABLE",
    evidence: "Synthetic original posting route passed the reachability check; application handoff is not certified.",
    checkedAt: "2026-07-18T17:41:08.379Z",
  },
  "harbor-product-data-analyst": {
    jobId: "harbor-product-data-analyst",
    state: "ORIGINAL_POSTING_RECORDED",
    evidence: "A synthetic original posting route is recorded; no reachability or application validation claim is made.",
    checkedAt: null,
  },
  "meridian-ml-infrastructure-engineer": {
    jobId: "meridian-ml-infrastructure-engineer",
    state: "VALIDATION_PENDING",
    evidence: "Destination evidence is intentionally withheld until validation completes.",
    checkedAt: null,
  },
  "juniper-customer-ai-enablement-lead": {
    jobId: "juniper-customer-ai-enablement-lead",
    state: "UNAVAILABLE",
    evidence: "No destination is exposed for this frozen synthetic role.",
    checkedAt: null,
  },
  "mosaic-junior-software-engineer": {
    jobId: "mosaic-junior-software-engineer",
    state: "APPLY_DESTINATION_VERIFIED",
    evidence: "Synthetic employer destination passed the complete Build Week handoff contract.",
    checkedAt: "2026-07-18T17:41:08.379Z",
  },
};

export type DestinationAction = {
  state: DestinationTrustState;
  label: "Apply on Employer Site ↗" | "Open Original Posting ↗" | "Destination verification pending" | "Original posting unavailable";
  href: string | null;
  interactive: boolean;
};

export function destinationTrustFor(jobId: string): DestinationTrustRecord {
  return FROZEN_DESTINATIONS[jobId] ?? {
    jobId,
    state: "UNAVAILABLE",
    evidence: "No frozen destination evidence exists for this role.",
    checkedAt: null,
  };
}

export function destinationActionFor(jobId: string): DestinationAction {
  const state = destinationTrustFor(jobId).state;
  if (state === "APPLY_DESTINATION_VERIFIED") {
    return { state, label: "Apply on Employer Site ↗", href: `/demo/employer-posting/${jobId}`, interactive: true };
  }
  if (state === "ORIGINAL_POSTING_RECORDED" || state === "URL_REACHABLE") {
    return { state, label: "Open Original Posting ↗", href: `/demo/employer-posting/${jobId}`, interactive: true };
  }
  if (state === "VALIDATION_PENDING") {
    return { state, label: "Destination verification pending", href: null, interactive: false };
  }
  return { state, label: "Original posting unavailable", href: null, interactive: false };
}

export function allFrozenDestinationRecords() {
  return Object.values(FROZEN_DESTINATIONS);
}
