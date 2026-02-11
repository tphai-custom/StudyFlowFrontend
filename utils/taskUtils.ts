import { Task, DifficultyLevel, TaskStatus } from '@/types';

/**
 * Create a new task with validation
 */
export function createTask(data: {
  title: string;
  description?: string;
  deadline: Date;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
}): Task {
  // Validate inputs
  if (!data.title.trim()) {
    throw new Error('Task title cannot be empty');
  }
  
  if (data.estimatedMinutes < 1) {
    throw new Error('Estimated time must be at least 1 minute');
  }
  
  if (data.deadline <= new Date()) {
    throw new Error('Deadline must be in the future');
  }
  
  // Validate estimated time is realistic
  const maxMinutesPerDay = 8 * 60; // 8 hours max per day
  if (data.estimatedMinutes > maxMinutesPerDay * 30) {
    throw new Error('Estimated time seems unrealistic (>30 days of 8hr/day work)');
  }
  
  const now = new Date();
  
  return {
    id: generateId(),
    title: data.title.trim(),
    description: data.description?.trim(),
    deadline: data.deadline,
    difficulty: data.difficulty,
    estimatedMinutes: data.estimatedMinutes,
    completedMinutes: 0,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update task progress
 */
export function updateTaskProgress(task: Task, completedMinutes: number): Task {
  const updatedTask = {
    ...task,
    completedMinutes: Math.min(completedMinutes, task.estimatedMinutes),
    updatedAt: new Date(),
  };
  
  // Auto-update status
  if (updatedTask.completedMinutes >= updatedTask.estimatedMinutes) {
    updatedTask.status = 'completed';
  } else if (updatedTask.completedMinutes > 0) {
    updatedTask.status = 'in-progress';
  }
  
  return updatedTask;
}

/**
 * Check if task is overdue
 */
export function isOverdue(task: Task): boolean {
  return task.deadline < new Date() && task.status !== 'completed';
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(task: Task): number {
  const now = new Date();
  const diffTime = task.deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get task urgency level
 */
export function getUrgency(task: Task): 'critical' | 'high' | 'medium' | 'low' {
  const days = getDaysUntilDeadline(task);
  
  if (days < 0) return 'critical'; // Overdue
  if (days <= 1) return 'critical';
  if (days <= 3) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
}

/**
 * Calculate task completion percentage
 */
export function getCompletionPercentage(task: Task): number {
  if (task.estimatedMinutes === 0) return 0;
  return Math.round((task.completedMinutes / task.estimatedMinutes) * 100);
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
}

/**
 * Format deadline to readable format
 */
export function formatDeadline(date: Date): string {
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Quá hạn ${Math.abs(diffDays)} ngày`;
  }
  if (diffDays === 0) {
    return 'Hôm nay';
  }
  if (diffDays === 1) {
    return 'Ngày mai';
  }
  if (diffDays <= 7) {
    return `${diffDays} ngày nữa`;
  }
  
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get difficulty label in Vietnamese
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó',
    'very-hard': 'Rất khó',
  };
  return labels[difficulty];
}

/**
 * Get status label in Vietnamese
 */
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    'pending': 'Chưa bắt đầu',
    'in-progress': 'Đang làm',
    'completed': 'Hoàn thành',
  };
  return labels[status];
}
