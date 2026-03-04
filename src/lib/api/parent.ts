import { apiGet, apiPost, apiPatch, apiPut } from "./client";

export interface LinkSchema {
  id: string;
  parent_id: string;
  student_id: string;
  status: string;
  created_at: string;
}

export interface LinkedStudentInfo {
  student_id: string;
  username: string;
  full_name: string;
  linked_at: string;
}

export interface SuggestionSchema {
  id: string;
  parent_id: string;
  student_id: string;
  type: string;
  payload: Record<string, unknown>;
  message?: string | null;
  status: string;
  created_at: string;
}

export interface UpcomingDeadline {
  task_id: string;
  title: string;
  subject: string;
  deadline: string;
  days_left: number;
}

export interface WeeklySummary {
  student_id: string;
  week: string;
  total_minutes: number;
  completion_rate: number;
  upcoming_deadlines: UpcomingDeadline[];
  alerts: string[];
  total_sessions: number;
  done_sessions: number;
  free_slot_minutes: number;
  planned_minutes: number;
}

export interface NudgeMessage {
  situation: string;
  text: string;
}

export interface NudgeResponse {
  student_name: string;
  tone: string;
  messages: NudgeMessage[];
  summary: WeeklySummary;
}

export interface NoteSchema {
  id: string;
  parent_id: string;
  student_id: string;
  message: string;
  tag: string;
  reaction?: string | null;
  created_at: string;
}

export interface StudentStats {
  total_minutes: number;
  completion_rate: number;
  top_subject: string | null;
  sessions_done: number;
  range: string;
}

export const parentRequestLink = (child_username: string, link_code: string) =>
  apiPost<LinkSchema>("/parent/link", { child_username, link_code });

export const parentListLinks = () => apiGet<LinkSchema[]>("/parent/links");

export const parentListChildren = () => apiGet<LinkSchema[]>("/parent/children");

export const parentGetLinkedStudents = () =>
  apiGet<LinkedStudentInfo[]>("/parent/linked-students");

export const parentGetChildTasks = (student_id: string, filter?: string) =>
  apiGet<unknown[]>(`/parent/students/${student_id}/tasks${filter ? `?filter=${filter}` : ""}`);

export const parentGetChildPlan = (student_id: string) =>
  apiGet<unknown>(`/parent/students/${student_id}/plan`);

export const parentGetChildHabits = (student_id: string) =>
  apiGet<unknown[]>(`/parent/child/${student_id}/habits`);

export const parentGetWeeklySummary = (student_id: string, week?: string) =>
  apiGet<WeeklySummary>(`/parent/students/${student_id}/weekly-summary${week ? `?week=${week}` : ""}`);

export interface DailySessionSummary {
  session_id: string;
  task_id?: string | null;
  task_title?: string | null;
  subject?: string | null;
  planned_start?: string | null;
  minutes: number;
  status: string;
}

export interface DailyReport {
  student_id: string;
  date: string;
  total_planned_minutes: number;
  total_done_minutes: number;
  completion_rate: number;
  sessions: DailySessionSummary[];
  alerts: string[];
}

export const parentGetDailyReport = (student_id: string, date?: string) =>
  apiGet<DailyReport>(`/parent/students/${student_id}/daily-report${date ? `?date=${date}` : ""}`);

// ---- Settings Lock ----

export interface SettingsLockSchema {
  student_id: string;
  parent_id: string;
  locked_fields: string[];
  locked_values?: Record<string, string | number | null>;
  updated_at?: string | null;
}

export const LOCKABLE_FIELDS = [
  { key: "daily_limit_minutes", label: "Giới hạn phút học/ngày" },
  { key: "break_preset", label: "Chế độ nghỉ (Pomodoro)" },
  { key: "buffer_percent", label: "% đệm kế hoạch" },
  { key: "timezone", label: "Múi giờ" },
];

export const parentGetSettingsLock = (student_id: string) =>
  apiGet<SettingsLockSchema>(`/parent/students/${student_id}/settings-lock`);

export const parentUpdateSettingsLock = (
  student_id: string,
  locked_fields: string[],
  locked_values?: Record<string, string | number | null>
) =>
  apiPut<SettingsLockSchema>(`/parent/students/${student_id}/settings-lock`, { locked_fields, locked_values });

export const studentGetLockedFields = () =>
  apiGet<string[]>("/parent/student/settings-locked-fields");

export const parentGetStudentStats = (student_id: string, range: "week" | "month" = "week") =>
  apiGet<StudentStats>(`/parent/students/${student_id}/stats?range=${range}`);

export const parentGetNudges = (student_id: string, tone: "light" | "medium" | "strict" = "medium") =>
  apiGet<NudgeResponse>(`/parent/students/${student_id}/nudges?tone=${tone}`);

export const parentCreateNote = (student_id: string, message: string, tag?: string) =>
  apiPost<NoteSchema>(`/parent/students/${student_id}/notes`, { message, tag: tag ?? "general" });

export const parentListNotes = (student_id: string) =>
  apiGet<NoteSchema[]>(`/parent/students/${student_id}/notes`);

export const studentReactNote = (note_id: string, reaction: string) =>
  apiPost<NoteSchema>(`/parent/notes/${note_id}/reaction`, { reaction });

export const studentListMyNotes = () =>
  apiGet<NoteSchema[]>("/parent/student/notes");

export const parentCreateSuggestion = (
  student_id: string,
  payload: { type: string; payload?: Record<string, unknown>; message?: string }
) => apiPost<SuggestionSchema>(`/parent/child/${student_id}/suggestions`, payload);

export const parentListSuggestions = (student_id: string) =>
  apiGet<SuggestionSchema[]>(`/parent/child/${student_id}/suggestions`);

// Student-facing
export const studentIncomingLinks = () => apiGet<LinkSchema[]>("/parent/incoming-links");

export const studentRespondLink = (link_id: string, status: "active" | "rejected") =>
  apiPatch<LinkSchema>(`/parent/links/${link_id}`, { status });

export const studentMySuggestions = () => apiGet<SuggestionSchema[]>("/parent/my-suggestions");

export const studentRespondSuggestion = (
  suggestion_id: string,
  status: "accepted" | "rejected"
) => apiPatch<SuggestionSchema>(`/parent/suggestions/${suggestion_id}`, { status });

// Parent creates a task directly in student's task list (B/H)
export interface ParentTaskCreatePayload {
  student_id: string;
  title: string;
  subject?: string;
  description?: string;
  deadline?: string;
  estimated_minutes?: number;
  priority?: 1 | 2 | 3;
  locked?: boolean;
  repeat?: "none" | "daily" | "weekly";
}

export const parentCreateTask = (payload: ParentTaskCreatePayload) =>
  apiPost("/parent/tasks", payload);

export const parentListStudentTasks = (student_id: string) =>
  apiGet(`/parent/students/${student_id}/tasks`);
