import { apiGet, apiPost } from "@/src/lib/api/client";
import { PlanRecord } from "@/src/lib/types";

/**
 * Ask the backend to rebuild the plan using stored tasks + slots + habits + feedback.
 * Returns null if there is insufficient data (e.g. no tasks or no free slots).
 */
export async function rebuildPlan(): Promise<PlanRecord | null> {
  try {
    const plan = await apiPost<PlanRecord>("/plan/rebuild", {});
    return plan;
  } catch {
    return null;
  }
}

/**
 * Trigger the browser to download the ICS file from the backend.
 */
export function exportPlan(_plan: PlanRecord, filename = "studyflow.ics") {
  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
    "http://localhost:8000/api/v1";
  const anchor = document.createElement("a");
  anchor.href = `${base}/plan/export/ics`;
  anchor.download = filename;
  anchor.click();
}
