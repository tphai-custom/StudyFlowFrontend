import { generatePlan } from "@/src/lib/planner/generatePlan";
import { downloadIcs } from "@/src/lib/planner/icsExport";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { listHabits } from "@/src/lib/storage/habitsRepo";
import { getSettings } from "@/src/lib/storage/settingsRepo";
import { listFeedback } from "@/src/lib/storage/feedbackRepo";
import { getUserProfile } from "@/src/lib/storage/profileRepo";
import { getLatestPlan, savePlan } from "@/src/lib/storage/planRepo";
import { PlanRecord } from "@/src/lib/types";

const tuneSettingsWithFeedback = async () => {
  const [settings, feedback] = await Promise.all([getSettings(), listFeedback()]);
  const tuned = { ...settings, breakPreset: { ...settings.breakPreset } };
  const latestFeedback = feedback.at(-1);
  if (!latestFeedback) return tuned;
  if (latestFeedback.label === "too_dense") {
    tuned.bufferPercent = Math.min(0.5, tuned.bufferPercent + 0.1);
  }
  if (latestFeedback.label === "too_easy") {
    tuned.bufferPercent = Math.max(0.05, tuned.bufferPercent - 0.05);
  }
  if (latestFeedback.label === "need_more_time") {
    tuned.dailyLimitMinutes = Math.min(600, tuned.dailyLimitMinutes + 30);
  }
  return tuned;
};

export async function rebuildPlan(): Promise<PlanRecord | null> {
  const [tasks, slots, habits, settings, profile, latestPlan] = await Promise.all([
    listTasks(),
    listSlots(),
    listHabits(),
    tuneSettingsWithFeedback(),
    getUserProfile(),
    getLatestPlan(),
  ]);
  if (tasks.length === 0 || slots.length === 0) {
    return null;
  }
  const plan = generatePlan({
    tasks,
    freeSlots: slots,
    habits,
    settings,
    nowIso: new Date().toISOString(),
    previousPlanVersion: latestPlan?.planVersion,
    userProfile: profile,
  });
  await savePlan(plan);
  return plan;
}

export function exportPlan(plan: PlanRecord, filename?: string) {
  downloadIcs(plan, filename);
}
