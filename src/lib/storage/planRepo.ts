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
  latest.sessions[sessionIndex] = {
    ...latest.sessions[sessionIndex],
    status,
  };
  await writeStore(STORE, history);
}
