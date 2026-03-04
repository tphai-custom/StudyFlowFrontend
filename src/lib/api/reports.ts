import { apiGet } from "./client";

export interface ReportItem {
  title: string;
  type: "STUDY" | "HABIT" | "BREAK";
  minutes: number;
  status: "done" | "pending" | "auto" | "skipped";
  task_id?: string | null;
}

export interface DayReport {
  date: string;
  study_minutes_done: number;
  study_minutes_planned: number;
  habit_minutes_done: number;
  habit_minutes_planned: number;
  break_minutes_planned: number;
  total_minutes_done: number;
  total_minutes_planned: number;
  completion_rate: number;
  items: ReportItem[];
}

export interface WeekReport {
  week: string;
  start_date: string;
  end_date: string;
  study_minutes_done: number;
  study_minutes_planned: number;
  habit_minutes_done: number;
  habit_minutes_planned: number;
  break_minutes_planned: number;
  total_minutes_done: number;
  total_minutes_planned: number;
  completion_rate: number;
  daily: Record<string, DayReport>;
}

export const getReportDay = (date?: string, studentId?: string) => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (studentId) params.set("student_id", studentId);
  return apiGet<DayReport>(`/reports/day?${params.toString()}`);
};

export const getReportWeek = (week?: string, studentId?: string) => {
  const params = new URLSearchParams();
  if (week) params.set("week", week);
  if (studentId) params.set("student_id", studentId);
  return apiGet<WeekReport>(`/reports/week?${params.toString()}`);
};
