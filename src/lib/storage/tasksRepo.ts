import { APP_TIMEZONE, Task, TaskMilestone } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

const STORE = "tasks" as const;

export async function listTasks(): Promise<Task[]> {
  return readStore<Task>(STORE);
}

const toMinutes = (value: number, unit: Task["durationUnit"]): number => {
  const multiplier = unit === "hours" ? 60 : 1;
  return Math.max(1, Math.round(value * multiplier));
};

export async function saveTask(payload: TaskFormValues & { id?: string }): Promise<Task> {
  const tasks = await listTasks();
  const now = new Date().toISOString();
  const existingIndex = payload.id
    ? tasks.findIndex((task) => task.id === payload.id)
    : -1;

  const durationUnit: Task["durationUnit"] = payload.durationUnit === "hours" ? "hours" : "minutes";
  const minMinutes = toMinutes(payload.durationEstimateMin, durationUnit);
  const maxMinutes = Math.max(minMinutes, toMinutes(payload.durationEstimateMax, durationUnit));
  const timezone = Intl?.DateTimeFormat().resolvedOptions().timeZone ?? APP_TIMEZONE;
  const successCriteria = payload.successCriteria.map((criteria) => criteria.trim()).filter(Boolean);
  const milestones: TaskMilestone[] | undefined = payload.milestones?.length
    ? payload.milestones.map((milestone) => ({
      id: crypto.randomUUID(),
      title: milestone.title.trim(),
      minutesEstimate: Math.max(5, Math.round(milestone.minutesEstimate)),
    }))
    : undefined;
  const baseTask: Task = {
    id: payload.id ?? crypto.randomUUID(),
    subject: payload.subject,
    title: payload.title,
    deadline: payload.deadline,
    timezone,
    difficulty: payload.difficulty as Task["difficulty"],
    durationEstimateMin: minMinutes,
    durationEstimateMax: maxMinutes,
    durationUnit,
    estimatedMinutes: maxMinutes,
    importance: payload.importance ? (payload.importance as 1 | 2 | 3) : undefined,
    contentFocus: payload.contentFocus,
    successCriteria,
    milestones,
    notes: undefined,
    createdAt: existingIndex >= 0 ? tasks[existingIndex].createdAt : now,
    updatedAt: now,
    progressMinutes: existingIndex >= 0 ? tasks[existingIndex].progressMinutes : 0,
  };

  if (existingIndex >= 0) {
    tasks[existingIndex] = baseTask;
  } else {
    tasks.push(baseTask);
  }
  await writeStore(STORE, tasks);
  return baseTask;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await listTasks();
  await writeStore(
    STORE,
    tasks.filter((task) => task.id !== id),
  );
}

export async function seedTasks(sample: Task[]): Promise<void> {
  await writeStore(STORE, sample);
}
