import { Feedback } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "feedback" as const;

export async function listFeedback(): Promise<Feedback[]> {
  return readStore<Feedback>(STORE);
}

export async function saveFeedback(payload: Omit<Feedback, "id" | "submittedAt">): Promise<Feedback> {
  const feedback = {
    ...payload,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  } satisfies Feedback;
  const all = await listFeedback();
  all.push(feedback);
  await writeStore(STORE, all);
  return feedback;
}
