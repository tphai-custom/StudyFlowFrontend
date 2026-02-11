export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very-hard';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  completedMinutes: number;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBlock {
  id: string;
  day: string; // e.g., 'monday', 'tuesday', etc.
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '11:00'
}

export interface StudySession {
  id: string;
  taskId: string;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  completed: boolean;
}

export interface Schedule {
  tasks: Task[];
  sessions: StudySession[];
  generatedAt: Date;
}

export interface UserAvailability {
  timeBlocks: TimeBlock[];
  maxDailyStudyMinutes: number;
}
