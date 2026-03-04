import { PlanRecord, Session } from "@/src/lib/types";
import { apiGet, apiPatch, ApiError } from "@/src/lib/api/client";

export interface TaskProgress {
  task_id: string;
  planned_minutes: number;
  done_minutes: number;
  progress_percent: number;
  sessions_done: number;
  total_sessions: number;
}

export interface SessionStatusResult {
  ok: boolean;
  task_progress?: TaskProgress | null;
}

export async function getPlanHistory(): Promise<PlanRecord[]> {
  const latest = await getLatestPlan();
  return latest ? [latest] : [];
}

export async function getLatestPlan(): Promise<PlanRecord | null> {
  try {
    return await apiGet<PlanRecord>("/plan/latest");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// Plan is persisted by the backend during rebuild – no-op on the client.
export async function savePlan(_record: PlanRecord): Promise<void> {
  return;
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session["status"],
): Promise<SessionStatusResult> {
  return await apiPatch<SessionStatusResult>(`/plan/sessions/${sessionId}/status`, { status });
}
