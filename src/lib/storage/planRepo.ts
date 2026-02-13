import { PlanRecord, Session } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "plan" as const;

export async function getPlanHistory(): Promise<PlanRecord[]> {
  return readStore<PlanRecord>(STORE);
}

export async function getLatestPlan(): Promise<PlanRecord | null> {
  const history = await getPlanHistory();
  return history.at(-1) ?? null;
}

export async function savePlan(record: PlanRecord): Promise<void> {
  const history = await getPlanHistory();
  history.push(record);
  await writeStore(STORE, history.slice(-5));
  const sortedSessions = [...record.sessions].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));
  console.info("[SESSIONS_PERSIST]", {
    totalSessions: record.sessions.length,
    firstSession: sortedSessions[0]?.plannedStart ?? null,
    lastSession: sortedSessions.at(-1)?.plannedEnd ?? sortedSessions.at(-1)?.plannedStart ?? null,
  });
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session["status"],
): Promise<void> {
  const history = await getPlanHistory();
  const latestIndex = history.length - 1;
  if (latestIndex < 0) return;
  const latest = history[latestIndex];
  const sessionIndex = latest.sessions.findIndex((session) => session.id === sessionId);
  if (sessionIndex < 0) return;
  const completedAt = status === "done" ? new Date().toISOString() : null;
  latest.sessions[sessionIndex] = {
    ...latest.sessions[sessionIndex],
    status,
    completedAt,
  };
  await writeStore(STORE, history);
}
