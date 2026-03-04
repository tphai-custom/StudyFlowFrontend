import { APP_TIMEZONE, Task, TaskMilestone } from "@/src/lib/types";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";
import { apiGet, apiPost, apiPut, apiDelete } from "@/src/lib/api/client";
import { getLatestPlan } from "@/src/lib/storage/planRepo";

const toMinutes = (value: number, unit: Task["durationUnit"]): number => {
  const multiplier = unit === "hours" ? 60 : 1;
  return Math.max(1, Math.round(value * multiplier));
};

/**
 * Enrich tasks with progress data computed from the latest plan's sessions.
 * This ensures taskDetail + taskList use the same source of truth.
 */
export function enrichTasksWithProgress(tasks: Task[], planSessions: { id: string; taskId?: string; source: string; status: string; minutes: number }[]): Task[] {
  const focusSessions = planSessions.filter((s) => s.source !== "break" && s.taskId);

  const byTask = new Map<string, { planned: number; done: number; total: number; doneSessions: number }>();
  for (const s of focusSessions) {
    if (!s.taskId) continue;
    const cur = byTask.get(s.taskId) ?? { planned: 0, done: 0, total: 0, doneSessions: 0 };
    cur.planned += s.minutes;
    cur.total += 1;
    if (s.status === "done") {
      cur.done += s.minutes;
      cur.doneSessions += 1;
    }
    byTask.set(s.taskId, cur);
  }

  return tasks.map((t) => {
    const p = byTask.get(t.id);
    if (!p || p.planned === 0) {
      // No sessions: use estimatedMinutes as planned, progressMinutes as done
      const done = t.progressMinutes ?? 0;
      const planned = t.estimatedMinutes ?? 1;
      return {
        ...t,
        plannedMinutes: planned,
        doneMinutes: done,
        progressPercent: Math.min(100, Math.round((done / planned) * 100)),
        sessionsDone: 0,
        totalSessions: 0,
      };
    }
    const progressPercent = Math.min(100, Math.round((p.done / p.planned) * 100));
    return {
      ...t,
      progressMinutes: p.done,
      plannedMinutes: p.planned,
      doneMinutes: p.done,
      progressPercent,
      sessionsDone: p.doneSessions,
      totalSessions: p.total,
    };
  });
}

export async function listTasks(): Promise<Task[]> {
  const [tasks, plan] = await Promise.all([
    apiGet<Task[]>("/tasks"),
    getLatestPlan().catch(() => null),
  ]);
  if (!plan?.sessions?.length) return tasks;
  return enrichTasksWithProgress(tasks, plan.sessions as Parameters<typeof enrichTasksWithProgress>[1]);
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

  // P1: duration mode and scheduling style
  const durationMode = payload.durationMode ?? "estimate";
  const durationMinutesExact =
    durationMode === "exact" && payload.durationMinutesExact
      ? Math.round(Number(payload.durationMinutesExact))
      : null;
  const schedulingStyle = payload.schedulingStyle ?? "balanced";

  const body = {
    subject: payload.subject,
    title: payload.title,
    deadline: payload.deadline,
    timezone,
    difficulty: payload.difficulty,
    durationEstimateMin: minMinutes,
    durationEstimateMax: maxMinutes,
    durationUnit,
    estimatedMinutes: durationMode === "exact" && durationMinutesExact ? durationMinutesExact : maxMinutes,
    importance: payload.importance,
    contentFocus: payload.contentFocus,
    successCriteria,
    milestones,
    notes: payload.notes,
    durationMode,
    durationMinutesExact,
    durationMinutesMin: durationMode === "estimate" ? minMinutes : null,
    durationMinutesMax: durationMode === "estimate" ? maxMinutes : null,
    schedulingStyle,
  };

  if (payload.id) {
    return apiPut<Task>(`/tasks/${payload.id}`, body);
  }
  return apiPost<Task>("/tasks", body);
}

export async function deleteTask(id: string): Promise<void> {
  await apiDelete(`/tasks/${id}`);
}

export async function seedTasks(sample: Task[]): Promise<void> {
  await Promise.all(
    sample.map((task) =>
      apiPost<Task>("/tasks", {
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
