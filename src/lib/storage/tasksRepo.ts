import { APP_TIMEZONE, Task, TaskMilestone } from "@/src/lib/types";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";
import { apiGet, apiPost, apiPut, apiDelete } from "@/src/lib/api/client";

const toMinutes = (value: number, unit: Task["durationUnit"]): number => {
  const multiplier = unit === "hours" ? 60 : 1;
  return Math.max(1, Math.round(value * multiplier));
};

export async function listTasks(): Promise<Task[]> {
  return apiGet<Task[]>("/tasks/");
}

export async function saveTask(payload: TaskFormValues & { id?: string; notes?: string }): Promise<Task> {
  const durationUnit: Task["durationUnit"] = payload.durationUnit === "hours" ? "hours" : "minutes";
  const minMinutes = toMinutes(payload.durationEstimateMin, durationUnit);
  const maxMinutes = Math.max(minMinutes, toMinutes(payload.durationEstimateMax, durationUnit));
  const timezone = Intl?.DateTimeFormat().resolvedOptions().timeZone ?? APP_TIMEZONE;
  const successCriteria = payload.successCriteria.map((c) => c.trim()).filter(Boolean);
  const milestones: TaskMilestone[] | undefined = payload.milestones?.length
    ? payload.milestones.map((m) => ({
        id: crypto.randomUUID(),
        title: m.title.trim(),
        minutesEstimate: Math.max(5, Math.round(m.minutesEstimate)),
      }))
    : undefined;

  const body = {
    subject: payload.subject,
    title: payload.title,
    deadline: payload.deadline,
    timezone,
    difficulty: payload.difficulty,
    durationEstimateMin: minMinutes,
    durationEstimateMax: maxMinutes,
    durationUnit,
    estimatedMinutes: maxMinutes,
    importance: payload.importance,
    contentFocus: payload.contentFocus,
    successCriteria,
    milestones,
    notes: payload.notes,
  };

  if (payload.id) {
    return apiPut<Task>(`/tasks/${payload.id}`, body);
  }
  return apiPost<Task>("/tasks/", body);
}

export async function deleteTask(id: string): Promise<void> {
  await apiDelete(`/tasks/${id}`);
}

export async function seedTasks(sample: Task[]): Promise<void> {
  await Promise.all(
    sample.map((task) =>
      apiPost<Task>("/tasks/", {
        subject: task.subject,
        title: task.title,
        deadline: task.deadline,
        timezone: task.timezone,
        difficulty: task.difficulty,
        durationEstimateMin: task.durationEstimateMin,
        durationEstimateMax: task.durationEstimateMax,
        durationUnit: task.durationUnit,
        estimatedMinutes: task.estimatedMinutes,
        importance: task.importance,
        contentFocus: task.contentFocus,
        successCriteria: task.successCriteria,
        milestones: task.milestones,
        notes: task.notes,
      }),
    ),
  );
}
