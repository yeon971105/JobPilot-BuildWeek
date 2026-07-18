"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { PrivateProfile, WorkPreferences } from "@/lib/private-profile";
import { DEFAULT_WORK_PREFERENCES } from "@/lib/private-profile";
import type { ScoreAnalysis } from "@/server/build-week/scorer";

export type PrivateAnalysisRecord = { analysis: ScoreAnalysis; provider: { analysisPipeline: string; deliveryMode: string; scoringEngine: string }; modelResult: { profileSummary: string; limitations: string[] }; analyzedAt: string };
type ProfileState = { mode: "DEMO" | "PRIVATE"; profile: PrivateProfile | null; preferences: WorkPreferences; analyses: Record<string, PrivateAnalysisRecord> };

export const PRIVATE_PROFILE_STORAGE_KEY = "jobpilot-private-local-profile-v1";
const SERVER_STATE: ProfileState = { mode: "DEMO", profile: null, preferences: DEFAULT_WORK_PREFERENCES, analyses: {} };
let browserState: ProfileState | null = null;
const listeners = new Set<() => void>();

function readState(): ProfileState {
  try {
    const value = JSON.parse(window.localStorage.getItem(PRIVATE_PROFILE_STORAGE_KEY) || "null") as ProfileState | null;
    return value?.preferences && value.analyses ? value : { ...SERVER_STATE, preferences: { ...DEFAULT_WORK_PREFERENCES } };
  } catch { return { ...SERVER_STATE, preferences: { ...DEFAULT_WORK_PREFERENCES } }; }
}
function snapshot() { if (!browserState) browserState = readState(); return browserState; }
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function commit(next: ProfileState) { browserState = next; window.localStorage.setItem(PRIVATE_PROFILE_STORAGE_KEY, JSON.stringify(next)); listeners.forEach((listener) => listener()); }

export function usePrivateProfile() {
  const state = useSyncExternalStore(subscribe, snapshot, () => SERVER_STATE);
  const setProfile = useCallback((profile: PrivateProfile) => commit({ ...snapshot(), mode: "PRIVATE", profile, analyses: {} }), []);
  const setPreferences = useCallback((preferences: WorkPreferences) => commit({ ...snapshot(), preferences, analyses: {} }), []);
  const useDemoProfile = useCallback(() => commit({ ...snapshot(), mode: "DEMO" }), []);
  const usePrivateProfileMode = useCallback(() => { const current = snapshot(); if (current.profile) commit({ ...current, mode: "PRIVATE" }); }, []);
  const saveAnalysis = useCallback((jobId: string, record: PrivateAnalysisRecord) => commit({ ...snapshot(), analyses: { ...snapshot().analyses, [jobId]: record } }), []);
  const clearLocalProfile = useCallback(() => commit({ mode: "DEMO", profile: null, preferences: { ...DEFAULT_WORK_PREFERENCES }, analyses: {} }), []);
  return { ...state, ready: state !== SERVER_STATE, setProfile, setPreferences, useDemoProfile, usePrivateProfileMode, saveAnalysis, clearLocalProfile };
}
