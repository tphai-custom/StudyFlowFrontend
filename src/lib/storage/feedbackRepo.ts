import { Feedback } from "@/src/lib/types";
import { apiGet, apiPost } from "@/src/lib/api/client";

export async function listFeedback(): Promise<Feedback[]> {
  return apiGet<Feedback[]>("/feedback/");
}

export async function saveFeedback(payload: Omit<Feedback, "id" | "submittedAt">): Promise<Feedback> {
  return apiPost<Feedback>("/feedback/", {
    label: payload.label,
    note: payload.note,
    planVersion: payload.planVersion,
  });
}
