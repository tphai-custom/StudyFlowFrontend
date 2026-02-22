import { apiGet, apiPatch, apiPost } from "./client";

export interface PlanSessionLockResponse {
  ok: boolean;
}

export const apiGetLatestPlan = () => apiGet<Record<string, unknown>>("/plan/latest");

export const apiRebuildPlan = () => apiPost<Record<string, unknown>>("/plan/rebuild", {});

export const apiLockSession = (sessionId: string, locked: boolean) =>
  apiPatch<PlanSessionLockResponse>(`/plan/sessions/${sessionId}/lock`, { locked });

export const apiRegeneratePlanPartial = () =>
  apiPost<Record<string, unknown>>("/plan/regenerate-partial", {});

export const apiUpdateSessionStatus = (sessionId: string, status: "done" | "skipped" | "pending") =>
  apiPatch<{ ok: boolean }>(`/plan/sessions/${sessionId}/status`, { status });
