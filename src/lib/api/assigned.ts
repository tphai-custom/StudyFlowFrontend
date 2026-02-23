import { apiGet, apiPost, apiPatch } from "./client";

export interface AssignedTask {
  id: string;
  parent_id: string;
  student_id: string;
  title: string;
  subject?: string | null;
  description?: string | null;
  deadline?: string | null;
  priority: number;
  tag: string;
  locked: boolean;
  type: string;
  status: string;
  student_note?: string | null;
  reschedule_requested_date?: string | null;
  reschedule_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitDayStatus {
  date: string;
  done: boolean;
}

export interface AssignedHabit {
  id: string;
  parent_id: string;
  student_id: string;
  name: string;
  frequency_type: string;
  frequency_value?: string | null;
  minutes: number;
  suggested_time?: string | null;
  locked: boolean;
  status: string;
  created_at: string;
  // enriched by backend
  ticked_today: boolean;
  ticked_at?: string | null;
  streak: number;
  last_7_days: HabitDayStatus[];
}

export interface HabitTick {
  id: string;
  habit_id: string;
  student_id: string;
  date: string;
  completed: boolean;
  note?: string | null;
  created_at: string;
}

export interface TaskItem {
  id: string;
  task_id: string;
  label: string;
  subject?: string | null;
  order_index: number;
  is_done: boolean;
  done_at?: string | null;
  done_by?: string | null;
  created_at: string;
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  actor_role: string;
  type: string;
  content?: string | null;
  created_at: string;
}

export interface Idea {
  id: string;
  parent_id: string;
  student_id: string;
  content: string;
  suggested_type: string;
  status: string;
  created_at: string;
}

export interface ParentAssignSettings {
  id: string;
  parent_id: string;
  default_tone: string;
  default_remind_time?: string | null;
  require_verify_for_locked_tasks: boolean;
  allow_student_reschedule: boolean;
  salutation: string;
  intervention_level: string;
  created_at: string;
  updated_at: string;
}

// ── Parent – Tasks ──────────────────────────────────────────────────────────

export const parentCreateAssignedTask = (
  childId: string,
  data: {
    title: string;
    subject?: string;
    description?: string;
    deadline?: string;
    priority?: number;
    tag?: string;
    locked?: boolean;
  },
) => apiPost<AssignedTask>(`/parent/${childId}/assigned-tasks`, data);

export const parentListAssignedTasks = (childId: string) =>
  apiGet<AssignedTask[]>(`/parent/${childId}/assigned-tasks`);

export const parentUpdateAssignedTask = (
  taskId: string,
  data: Partial<AssignedTask>,
) => apiPatch<AssignedTask>(`/parent/assigned-tasks/${taskId}`, data);

// P1 – Task items
export const parentAddTaskItem = (
  taskId: string,
  data: { label: string; subject?: string; order_index?: number },
) => apiPost<TaskItem>(`/parent/assigned-tasks/${taskId}/items`, data);

export const parentListTaskItems = (taskId: string) =>
  apiGet<TaskItem[]>(`/parent/assigned-tasks/${taskId}/items`);

export const parentListTaskUpdates = (taskId: string) =>
  apiGet<TaskUpdate[]>(`/parent/assigned-tasks/${taskId}/updates`);

// ── Student – Tasks ─────────────────────────────────────────────────────────

export const studentListAssignedTasks = () =>
  apiGet<AssignedTask[]>("/student/assigned-tasks");

export const studentAcceptTask = (taskId: string) =>
  apiPost<AssignedTask>(`/student/assigned-tasks/${taskId}/accept`, {});

export const studentMarkTaskDone = (taskId: string) =>
  apiPost<AssignedTask>(`/student/assigned-tasks/${taskId}/done`, {});

export const studentRequestReschedule = (
  taskId: string,
  data: {
    student_note?: string;
    reschedule_requested_date?: string;
    reschedule_reason?: string;
  },
) =>
  apiPost<AssignedTask>(
    `/student/assigned-tasks/${taskId}/request-reschedule`,
    data,
  );

// P1 – Task items (student ticks checklist)
export const studentListTaskItems = (taskId: string) =>
  apiGet<TaskItem[]>(`/student/assigned-tasks/${taskId}/items`);

export const studentUpdateTaskItem = (
  taskId: string,
  itemId: string,
  data: { is_done?: boolean },
) => apiPatch<TaskItem>(`/student/assigned-tasks/${taskId}/items/${itemId}`, data);

export const studentQuickTaskUpdate = (
  taskId: string,
  type: string,
  content?: string,
) =>
  apiPost<TaskUpdate>(`/student/assigned-tasks/${taskId}/quick-update`, {
    type,
    content,
  });

export const studentListTaskUpdates = (taskId: string) =>
  apiGet<TaskUpdate[]>(`/student/assigned-tasks/${taskId}/updates`);

// ── Parent – Habits ─────────────────────────────────────────────────────────

export const parentCreateAssignedHabit = (
  childId: string,
  data: {
    name: string;
    frequency_type?: string;
    frequency_value?: string;
    minutes?: number;
    suggested_time?: string;
    locked?: boolean;
  },
) => apiPost<AssignedHabit>(`/parent/${childId}/assigned-habits`, data);

export const parentListAssignedHabits = (childId: string) =>
  apiGet<AssignedHabit[]>(`/parent/${childId}/assigned-habits`);

export const parentListHabitsWithStatus = (childId: string) =>
  apiGet<AssignedHabit[]>(`/parent/${childId}/assigned-habits-status`);

export const parentPraiseHabit = (habitId: string) =>
  apiPost<{ message_id: string; content: string }>(
    `/parent/assigned-habits/${habitId}/praise`,
    {},
  );

// ── Student – Habits ────────────────────────────────────────────────────────

export const studentListAssignedHabits = () =>
  apiGet<AssignedHabit[]>("/student/assigned-habits");

export const studentTickHabit = (
  habitId: string,
  date?: string,
  note?: string,
) => {
  const today = date ?? new Date().toISOString().split("T")[0];
  return apiPost<AssignedHabit>(`/student/assigned-habits/${habitId}/tick-today`, {
    date: today,
    note,
  });
};

// ── Ideas ───────────────────────────────────────────────────────────────────

export const parentCreateIdea = (
  childId: string,
  data: { content: string; suggested_type?: string },
) => apiPost<Idea>(`/parent/${childId}/ideas`, data);

export const studentListIdeas = () => apiGet<Idea[]>("/student/ideas");

export const studentAcceptIdea = (ideaId: string, convert_type: string = "task") =>
  apiPost<Record<string, string>>(`/student/ideas/${ideaId}/accept`, {
    convert_type,
  });

export const studentDeferIdea = (ideaId: string) =>
  apiPost<{ idea_id: string; status: string }>(`/student/ideas/${ideaId}/later`, {});

// ── Parent Settings ─────────────────────────────────────────────────────────

export const parentGetAssignSettings = () =>
  apiGet<ParentAssignSettings>("/parent/settings-assign");

export const parentUpdateAssignSettings = (
  data: Partial<ParentAssignSettings>,
) => apiPatch<ParentAssignSettings>("/parent/settings-assign", data);
