import { apiGet } from "./client";

export interface TaskProgressResult {
  task_id: string;
  title: string;
  subject: string | null;
  planned_minutes: number;
  done_minutes: number;
  progress_percent: number;
  sessions_done: number;
  total_sessions: number;
}

export interface ProgressSummary {
  range: string;
  total_planned_minutes: number;
  total_done_minutes: number;
  completion_rate: number;
  study_minutes: number;
  habit_minutes: number;
  sessions_done: number;
  total_sessions: number;
}

export const getTaskProgress = (taskId: string) =>
  apiGet<TaskProgressResult>(`/progress/task/${taskId}`);

export const getProgressSummary = (range: "day" | "week" = "week", studentId?: string) =>
  apiGet<ProgressSummary>(
    `/progress/summary?range=${range}${studentId ? `&student_id=${studentId}` : ""}`,
  );
