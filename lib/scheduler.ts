import { Task, StudySession, UserAvailability, TimeBlock, DifficultyLevel } from '@/types';

/**
 * Smart scheduling algorithm that:
 * 1. Prevents forgetting deadlines by creating specific study sessions
 * 2. Prevents cramming by distributing tasks over time
 * 3. Creates realistic plans based on actual availability
 */

interface ScheduleOptions {
  tasks: Task[];
  availability: UserAvailability;
  startDate?: Date;
}

const DIFFICULTY_MULTIPLIER: Record<DifficultyLevel, number> = {
  'easy': 1.0,
  'medium': 1.2,
  'hard': 1.5,
  'very-hard': 2.0,
};

const MIN_SESSION_MINUTES = 25; // Minimum meaningful study session (Pomodoro)
const MAX_SESSION_MINUTES = 120; // Maximum to prevent burnout
const BUFFER_DAYS = 1; // Buffer before deadline to prevent last-minute stress

/**
 * Generate optimal study schedule
 */
export function generateSchedule({ tasks, availability, startDate = new Date() }: ScheduleOptions): StudySession[] {
  const sessions: StudySession[] = [];
  
  // Filter out completed tasks
  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  
  // Sort tasks by urgency (deadline) and difficulty
  const sortedTasks = prioritizeTasks(pendingTasks);
  
  // Get available time slots starting from today
  const timeSlots = generateTimeSlots(availability, startDate, getMaxDeadline(sortedTasks));
  
  // Distribute tasks across time slots
  let slotIndex = 0;
  
  for (const task of sortedTasks) {
    const remainingMinutes = task.estimatedMinutes - task.completedMinutes;
    
    if (remainingMinutes <= 0) continue;
    
    // Calculate how many sessions needed for this task
    const adjustedMinutes = Math.ceil(remainingMinutes * DIFFICULTY_MULTIPLIER[task.difficulty]);
    
    // Spread task across multiple sessions to prevent cramming
    const sessionCount = Math.ceil(adjustedMinutes / MAX_SESSION_MINUTES);
    const minutesPerSession = Math.ceil(adjustedMinutes / sessionCount);
    
    // Calculate days before deadline to start
    const daysUntilDeadline = getDaysUntilDate(startDate, task.deadline);
    const daysNeeded = Math.ceil(sessionCount * 1.5); // Add spacing between sessions
    
    // Validate we have enough time
    if (daysNeeded > daysUntilDeadline - BUFFER_DAYS) {
      console.warn(`Task "${task.title}" may require cramming - not enough time before deadline`);
    }
    
    // Distribute sessions across available time slots
    let allocatedMinutes = 0;
    let sessionsCreated = 0;
    
    while (allocatedMinutes < adjustedMinutes && slotIndex < timeSlots.length) {
      const slot = timeSlots[slotIndex];
      
      // Check if this slot is before the deadline
      if (slot.date > new Date(task.deadline.getTime() - BUFFER_DAYS * 24 * 60 * 60 * 1000)) {
        slotIndex++;
        continue;
      }
      
      const sessionMinutes = Math.min(
        minutesPerSession,
        adjustedMinutes - allocatedMinutes,
        slot.availableMinutes
      );
      
      if (sessionMinutes >= MIN_SESSION_MINUTES) {
        const session: StudySession = {
          id: `${task.id}-session-${sessionsCreated}`,
          taskId: task.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: calculateEndTime(slot.startTime, sessionMinutes),
          durationMinutes: sessionMinutes,
          completed: false,
        };
        
        sessions.push(session);
        allocatedMinutes += sessionMinutes;
        sessionsCreated++;
        slot.availableMinutes -= sessionMinutes;
      }
      
      slotIndex++;
      
      // Skip some slots to prevent cramming (space out sessions)
      if (sessionsCreated < sessionCount) {
        slotIndex += Math.floor(daysUntilDeadline / sessionCount / 2);
      }
    }
    
    // Validate that we allocated enough time
    if (allocatedMinutes < adjustedMinutes * 0.8) {
      console.warn(`Task "${task.title}" is under-scheduled. Need ${adjustedMinutes} min, allocated ${allocatedMinutes} min`);
    }
  }
  
  return sessions;
}

/**
 * Prioritize tasks based on deadline urgency and difficulty
 */
function prioritizeTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First sort by deadline (earlier deadlines first)
    const deadlineDiff = a.deadline.getTime() - b.deadline.getTime();
    if (deadlineDiff !== 0) return deadlineDiff;
    
    // Then by difficulty (harder tasks first to allow more time)
    const difficultyOrder = { 'very-hard': 0, 'hard': 1, 'medium': 2, 'easy': 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
}

/**
 * Generate available time slots based on user availability
 */
function generateTimeSlots(availability: UserAvailability, startDate: Date, endDate: Date): Array<{
  date: Date;
  startTime: string;
  availableMinutes: number;
}> {
  const slots: Array<{ date: Date; startTime: string; availableMinutes: number }> = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  while (currentDate <= end) {
    const dayName = dayNames[currentDate.getDay()];
    const dayBlocks = availability.timeBlocks.filter(block => block.day === dayName);
    
    for (const block of dayBlocks) {
      const blockMinutes = getMinutesBetween(block.startTime, block.endTime);
      const availableMinutes = Math.min(blockMinutes, availability.maxDailyStudyMinutes);
      
      if (availableMinutes >= MIN_SESSION_MINUTES) {
        slots.push({
          date: new Date(currentDate),
          startTime: block.startTime,
          availableMinutes,
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
}

/**
 * Get maximum deadline from tasks
 */
function getMaxDeadline(tasks: Task[]): Date {
  if (tasks.length === 0) return new Date();
  return new Date(Math.max(...tasks.map(t => t.deadline.getTime())));
}

/**
 * Get days between two dates
 */
function getDaysUntilDate(from: Date, to: Date): number {
  const diffTime = to.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate minutes between two time strings (HH:MM format)
 */
function getMinutesBetween(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

/**
 * Calculate end time given start time and duration
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + durationMinutes;
  
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

/**
 * Validate that a schedule is realistic
 */
export function validateSchedule(
  sessions: StudySession[],
  availability: UserAvailability
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Group sessions by date
  const sessionsByDate = new Map<string, StudySession[]>();
  sessions.forEach(session => {
    const dateKey = session.date.toISOString().split('T')[0];
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });
  
  // Check each day doesn't exceed max daily study time
  sessionsByDate.forEach((daySessions, dateKey) => {
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    
    if (totalMinutes > availability.maxDailyStudyMinutes) {
      warnings.push(`${dateKey}: Scheduled ${totalMinutes} minutes exceeds max ${availability.maxDailyStudyMinutes} minutes`);
    }
    
    // Warn if scheduling too much in one day (potential cramming)
    if (totalMinutes > availability.maxDailyStudyMinutes * 0.9) {
      warnings.push(`${dateKey}: Near maximum capacity (${totalMinutes} minutes) - may be too intensive`);
    }
  });
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
