"use client";

import { useCallback, useSyncExternalStore } from "react";

export type TrackerStage = "SAVED" | "INTERESTED" | "PREPARING" | "APPLIED";
export type TrackerRecord = { jobId: string; stage: TrackerStage; previousStage: TrackerStage | null; note: string; updatedAt: string };
type DemoState = { sessionId: string; records: Record<string, TrackerRecord> };

export const DEMO_STORAGE_KEY = "jobpilot-demo-session-v22";
const SERVER_STATE: DemoState = { sessionId: "demo-server-snapshot", records: {} };
let browserState: DemoState | null = null;
const listeners = new Set<() => void>();

function emptyState(): DemoState { return { sessionId: `demo-${Date.now().toString(36)}`, records: {} }; }

function readStoredState(): DemoState {
  try {
    const value = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) || "null") as DemoState | null;
    return value?.sessionId && value.records ? value : emptyState();
  } catch { return emptyState(); }
}

function getBrowserSnapshot() {
  if (!browserState) browserState = readStoredState();
  return browserState;
}

function commitState(next: DemoState) {
  browserState = next;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }

export function resetDemoSession() {
  const state = emptyState();
  commitState(state);
  window.sessionStorage.setItem("jobpilot-demo-tour", "pending");
  return state;
}

export function useDemoTracker() {
  const state = useSyncExternalStore(subscribe, getBrowserSnapshot, () => SERVER_STATE);
  const commit = useCallback((updater: (current: DemoState) => DemoState) => commitState(updater(getBrowserSnapshot())), []);
  const setStage = useCallback((jobId: string, stage: TrackerStage) => commit((current) => {
    const existing = current.records[jobId];
    return { ...current, records: { ...current.records, [jobId]: { jobId, stage, previousStage: existing?.stage ?? null, note: existing?.note ?? "", updatedAt: new Date().toISOString() } } };
  }), [commit]);
  const remove = useCallback((jobId: string) => commit((current) => { const records = { ...current.records }; delete records[jobId]; return { ...current, records }; }), [commit]);
  const toggleSaved = useCallback((jobId: string) => { if (getBrowserSnapshot().records[jobId]) remove(jobId); else setStage(jobId, "SAVED"); }, [remove, setStage]);
  const restore = useCallback((jobId: string) => commit((current) => { const existing = current.records[jobId]; if (!existing?.previousStage) return current; return { ...current, records: { ...current.records, [jobId]: { ...existing, stage: existing.previousStage, previousStage: existing.stage, updatedAt: new Date().toISOString() } } }; }), [commit]);
  const setNote = useCallback((jobId: string, note: string) => commit((current) => { const existing = current.records[jobId] ?? { jobId, stage: "SAVED" as const, previousStage: null, note: "", updatedAt: "" }; return { ...current, records: { ...current.records, [jobId]: { ...existing, note: note.slice(0, 180), updatedAt: new Date().toISOString() } } }; }), [commit]);
  return { ...state, ready: state !== SERVER_STATE, setStage, remove, toggleSaved, restore, setNote };
}
