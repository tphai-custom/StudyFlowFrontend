export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

export type ID = string;

export type Task = {
  id: ID;
  subject: string;
  title: string;
  deadline: string; // ISO string in APP_TIMEZONE
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  importance?: 1 | 2 | 3;
  contentFocus?: string;
  successCriteria?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  progressMinutes: number;
};

export type Habit = {
  id: ID;
  name: string;
  cadence: "daily" | "weekly";
  weekday?: number;
  minutes: number;
  preset?: "pomodoro" | "deep-work" | "focus-30";
  createdAt: string;
};

export type FreeSlot = {
  id: ID;
  weekday: number; // 0 = Sunday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacityMinutes: number;
  source?: "user" | "auto";
  createdAt: string;
};

export type Session = {
  id: ID;
  taskId: ID;
  subject: string;
  title: string;
  plannedStart: string;
  plannedEnd: string;
  minutes: number;
  bufferMinutes: number;
  status: "pending" | "done" | "skipped";
  checklist?: string[];
  successCriteria?: string;
  planVersion: number;
};

export type BreakSession = {
  id: ID;
  label: string;
  plannedStart: string;
  plannedEnd: string;
  minutes: number;
  attachedToSessionId?: ID;
  planVersion: number;
};

export type LibraryItem = {
  id: ID;
  subject: string;
  level: string;
  title: string;
  summary: string;
  url?: string;
  tags: string[];
};

export type TemplatePlan = {
  id: ID;
  name: string;
  durationDays: number;
  recommendedMinutesPerDay: number;
  tasks: Array<Pick<Task, "subject" | "title" | "estimatedMinutes" | "difficulty">>;
};

export type ProgramMilestone = {
  id: ID;
  title: string;
  successCriteria: string;
  suggestedTasks: Array<Pick<Task, "subject" | "title" | "estimatedMinutes" | "difficulty">>;
};

export type Program = {
  id: ID;
  name: string;
  target: string;
  milestones: ProgramMilestone[];
};

export type MistakeLog = {
  id: ID;
  taskId?: ID;
  note: string;
  occurredAt: string;
  severity: "low" | "medium" | "high";
};

export type Feedback = {
  id: ID;
  label: "too_dense" | "too_easy" | "need_more_time" | "evening_focus" | "custom";
  note?: string;
  submittedAt: string;
  planVersion: number;
};

export type StatsSummary = {
  id: ID;
  generatedAt: string;
  totalMinutesWeek: number;
  totalMinutesDay: number;
  subjectBreakdown: Record<string, number>;
  completionRate: number;
};

export type AppSettings = {
  id: ID;
  dailyLimitMinutes: number;
  bufferPercent: number;
  breakPreset: {
    focus: number;
    rest: number;
    label: string;
  };
  timezone: string;
  lastUpdated: string;
};

export type PlannerInput = {
  tasks: Task[];
  freeSlots: FreeSlot[];
  settings: AppSettings;
  nowIso: string;
  previousPlanVersion?: number;
};

export type PlanSuggestion = {
  type:
    | "increase_free_time"
    | "reduce_duration"
    | "extend_deadline"
    | "reduce_buffer"
    | "adjust_daily_limit";
  message: string;
};

export type PlannerOutput = {
  planVersion: number;
  sessions: Session[];
  breaks: BreakSession[];
  unscheduledTasks: Task[];
  suggestions: PlanSuggestion[];
  generatedAt: string;
};

export type PlanRecord = PlannerOutput;
