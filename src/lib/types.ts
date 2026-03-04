export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

export type ID = string;

export type DurationUnit = "minutes" | "hours";

/** P1: Whether task has exact or estimated (range) duration */
export type DurationMode = "exact" | "estimate";

/** P1: How the planner distributes sessions across available days */
export type SchedulingStyle = "front-load" | "balanced" | "deadline-loaded";

export type TaskMilestone = {
  id: ID;
  title: string;
  minutesEstimate: number;
};

export type Task = {
  id: ID;
  subject: string;
  title: string;
  deadline: string; // ISO string + timezone
  timezone: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationEstimateMin: number;
  durationEstimateMax: number;
  durationUnit: DurationUnit;
  estimatedMinutes: number; // normalized to minutes, planner uses this as max minutes
  importance?: 1 | 2 | 3;
  contentFocus?: string;
  successCriteria: string[];
  milestones?: TaskMilestone[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  progressMinutes: number;
  /** Computed from plan sessions: done minutes / planned minutes × 100 */
  progressPercent?: number;
  /** Total planned minutes from sessions (may differ from estimatedMinutes) */
  plannedMinutes?: number;
  /** Done minutes from sessions with status=done */
  doneMinutes?: number;
  /** Number of sessions with status=done */
  sessionsDone?: number;
  /** Total sessions scheduled for this task */
  totalSessions?: number;
  lockedByParent?: boolean;
  createdByRole?: string;
  // Parent-assigned task fields
  source?: "student" | "parent";
  locked?: boolean;
  repeat?: "none" | "daily" | "weekly";
  childCanDelete?: boolean;
  childCanEditCore?: boolean;
  parentId?: string | null;
  // P1: duration mode
  durationMode?: DurationMode;
  durationMinutesExact?: number | null;
  durationMinutesMin?: number | null;
  durationMinutesMax?: number | null;
  // P1: scheduling style
  schedulingStyle?: SchedulingStyle;
  // C1: planner hard cap (computed by backend)
  targetMinutes?: number;
};

export type Habit = {
  id: ID;
  name: string;
  cadence: "daily" | "weekly";
  weekday?: number;
  minutes: number;
  preset?: "pomodoro" | "deep-work" | "focus-30";
  preferredStart?: string; // HH:mm for recurring placement
  energyWindow?: "morning" | "afternoon" | "evening";
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

export type SessionSource = "task" | "habit" | "break";

export type SessionType = "STUDY" | "HABIT" | "BREAK";

export type Session = {
  id: ID;
  taskId?: ID;
  habitId?: ID;
  source: SessionSource;
  // B1: canonical session type
  sessionType?: SessionType;
  subject: string;
  title: string;
  plannedStart: string;
  plannedEnd: string;
  minutes: number;
  // C4: study_minutes excludes buffer; occupied includes buffer
  studyMinutes?: number;
  occupiedMinutes?: number;
  bufferMinutes: number;
  status: "pending" | "done" | "skipped" | "auto";
  checklist?: string[];
  successCriteria?: string[];
  milestoneTitle?: string;
  completedAt?: string | null;
  planVersion: number;
};

export type LibraryItem = {
  id: ID;
  subject: string;       // toan | ngu_van | tieng_anh | lich_su | dia_li
  grade?: number | null; // 6..10
  level: string;
  title: string;
  summary: string;
  description?: string | null;
  resource_type: string; // lesson | summary | worksheet | video | book | website
  difficulty?: number | null; // 1..5
  url?: string | null;
  tags: string[];
  created_by?: string | null;
};

/** v2: one record per (grade, subject) with 4 content groups */
export type LibraryItemV2 = {
  id: ID;
  grade: number;
  subject: string;
  title: string;
  lessons: string[];   // 3 items
  summaries: string[]; // 2 items
  exercises: string[]; // 2 items
  videos: string[];    // 2 items
  tags: string[];
};

export type TemplatePlan = {
  id: ID;
  name: string;
  durationDays: number;
  recommendedMinutesPerDay: number;
  forWho: string;
  recommendedFor: string[];
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
  recommendedFor: string[];
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
  habits: Habit[];
  settings: AppSettings;
  nowIso: string;
  previousPlanVersion?: number;
  userProfile?: UserProfile | null;
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
  unscheduledTasks: Task[];
  suggestions: PlanSuggestion[];
  generatedAt: string;
};

export type PlanRecord = PlannerOutput;

export type EnergyLevel = "low" | "medium" | "high";

export type UserProfile = {
  id: ID;
  gradeLevel: string;
  goals: string[];
  weakSubjects: string[];
  strongSubjects: string[];
  learningPace: "slow" | "balanced" | "fast";
  energyPreferences: {
    morning: EnergyLevel;
    afternoon: EnergyLevel;
    evening: EnergyLevel;
  };
  dailyLimitPreference: number;
  favoriteBreakPreset: string;
  timezone: string;
  tzOffsetMinutes: number; // GMT offset in minutes, e.g. GMT+7 = 420
  updatedAt: string;
};
