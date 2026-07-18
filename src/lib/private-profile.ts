export type PrivateRole = {
  id: string;
  title: string;
  organization: string;
  startMonth: string;
  endMonth: string;
  summary: string;
};

export type PrivateProject = { id: string; name: string; summary: string };
export type PrivateEvidence = { id: string; label: string; text: string; capabilities: string[] };

export type PrivateProfile = {
  id: string;
  label: "Private Local Resume";
  source: "PRIVATE_LOCAL_RESUME";
  format: "PDF" | "DOCX" | "TXT";
  contentHash: string;
  processedAt: string;
  confirmedAt: string | null;
  completeness: number;
  roleHistory: PrivateRole[];
  projects: PrivateProject[];
  skills: string[];
  education: string[];
  certifications: string[];
  evidence: PrivateEvidence[];
  warnings: string[];
};

export type WorkPreferences = {
  acceptedWorkModes: Array<"REMOTE" | "HYBRID" | "ONSITE">;
  preferredLocations: string[];
  remoteEligibility: "YES" | "NO" | "NEEDS_CLARIFICATION";
  maximumTravelPercent: number | null;
  willingToRelocate: boolean;
  authorizationNote: string;
};

export const DEFAULT_WORK_PREFERENCES: WorkPreferences = {
  acceptedWorkModes: ["REMOTE", "HYBRID"],
  preferredLocations: ["San Francisco", "Oakland"],
  remoteEligibility: "YES",
  maximumTravelPercent: 20,
  willingToRelocate: false,
  authorizationNote: "",
};
