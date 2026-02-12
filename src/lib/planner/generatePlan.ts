import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { cleanSlots } from "@/src/lib/planner/cleanSlots";
import {
  AppSettings,
  FreeSlot,
  Habit,
  PlanSuggestion,
  PlannerInput,
  PlannerOutput,
  Session,
  Task,
} from "@/src/lib/types";

const MIN_SESSION_MINUTES = 25;
const MAX_SESSION_MINUTES = 120;

type DaySegment = {
  start: Date;
  end: Date;
  used: number;
};

type DayBucket = {
  isoDate: string;
  weekday: number;
  segments: DaySegment[];
  allowedMinutes: number;
  used: number;
};

const toDateTime = (isoDate: string, time: string) => new Date(`${isoDate}T${time}:00+07:00`);

const buildBuckets = (
  now: Date,
  end: Date,
  slots: FreeSlot[],
  settings: AppSettings,
): DayBucket[] => {
  const buckets: DayBucket[] = [];
  let cursor = startOfDay(now);
  const endOfWindow = startOfDay(end);

  while (!isBefore(endOfWindow, cursor)) {
    const isoDate = format(cursor, "yyyy-MM-dd");
    const weekday = cursor.getDay();
    const slotForDay = slots.filter((slot) => slot.weekday === weekday);
    const segments = slotForDay.map((slot) => {
      const segmentStart = toDateTime(isoDate, slot.startTime);
      const startSafe = cursor.toDateString() === startOfDay(now).toDateString()
        ? new Date(Math.max(segmentStart.getTime(), now.getTime()))
        : segmentStart;
      return {
        start: startSafe,
        end: toDateTime(isoDate, slot.endTime),
        used: 0,
      } satisfies DaySegment;
    });

    const totalMinutes = segments.reduce(
      (sum, segment) => sum + Math.max(0, differenceInMinutes(segment.end, segment.start)),
      0,
    );
    const allowed = Math.max(
      0,
      Math.min(
        settings.dailyLimitMinutes,
        Math.floor(totalMinutes * (1 - settings.bufferPercent)),
      ),
    );
    buckets.push({
      isoDate,
      weekday,
      segments,
      allowedMinutes: allowed,
      used: 0,
    });
    cursor = addDays(cursor, 1);
  }

  return buckets;
};

const prioritizeTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadlineDiff !== 0) return deadlineDiff;
    if ((b.importance ?? 0) !== (a.importance ?? 0)) {
      return (b.importance ?? 0) - (a.importance ?? 0);
    }
    if (b.difficulty !== a.difficulty) {
      return b.difficulty - a.difficulty;
    }
    return b.estimatedMinutes - a.estimatedMinutes;
  });
};

const takeFromBucket = (
  bucket: DayBucket,
  remaining: number,
  chunkPreference: number,
  options: { allowShorterThanMin?: boolean } = {},
): { sessionStart: Date; sessionEnd: Date; minutes: number } | null => {
  const { allowShorterThanMin = false } = options;
  if (bucket.used >= bucket.allowedMinutes) {
    return null;
  }
  for (const segment of bucket.segments) {
    const segmentCapacity = Math.max(0, differenceInMinutes(segment.end, segment.start) - segment.used);
    if (segmentCapacity <= 0) continue;
    const remainingMinutesToday = bucket.allowedMinutes - bucket.used;
    const chunk = Math.min(
      chunkPreference,
      remaining,
      segmentCapacity,
      MAX_SESSION_MINUTES,
      remainingMinutesToday,
    );
    if (!allowShorterThanMin && chunk < MIN_SESSION_MINUTES && remaining > MIN_SESSION_MINUTES) {
      continue;
    }
    const minutes = chunk === 0 ? Math.min(remaining, segmentCapacity) : chunk;
    const sessionStart = addMinutes(segment.start, segment.used);
    const sessionEnd = addMinutes(sessionStart, minutes);
    segment.used += minutes;
    bucket.used += minutes;
    return { sessionStart, sessionEnd, minutes };
  }
  return null;
};

const scheduleHabits = (
  buckets: DayBucket[],
  habits: Habit[],
  settings: AppSettings,
  planVersion: number,
): { sessions: Session[]; suggestions: PlanSuggestion[] } => {
  const habitSessions: Session[] = [];
  const suggestions: PlanSuggestion[] = [];

  buckets.forEach((bucket) => {
    habits.forEach((habit) => {
      const shouldSchedule =
        habit.cadence === "daily" || (habit.cadence === "weekly" && habit.weekday === bucket.weekday);
      if (!shouldSchedule) return;
      let remaining = habit.minutes;
      let allocation = takeFromBucket(bucket, remaining, habit.minutes, { allowShorterThanMin: true });
      if (!allocation) {
        suggestions.push({
          type: "increase_free_time",
          message: `Không đủ slot cho habit "${habit.name}" vào ${bucket.isoDate}.`,
        });
        return;
      }
      while (allocation && remaining > 0) {
        const minutes = allocation.minutes;
        habitSessions.push({
          id: crypto.randomUUID(),
          habitId: habit.id,
          source: "habit",
          subject: "Thói quen",
          title: habit.name,
          plannedStart: allocation.sessionStart.toISOString(),
          plannedEnd: allocation.sessionEnd.toISOString(),
          minutes,
          bufferMinutes: Math.round(minutes * settings.bufferPercent * 0.5),
          status: "pending",
          checklist: undefined,
          successCriteria: [`Duy trì ${minutes} phút`],
          milestoneTitle: undefined,
          completedAt: null,
          planVersion,
        });
        remaining -= minutes;
        allocation = remaining > 0
          ? takeFromBucket(bucket, remaining, habit.minutes, { allowShorterThanMin: true })
          : null;
      }
    });
  });

  return { sessions: habitSessions, suggestions };
};

const applyBreaks = (
  focusSessions: Session[],
  settings: AppSettings,
  planVersion: number,
): Session[] => {
  if (focusSessions.length === 0) return [];
  const byDay = focusSessions.reduce<Record<string, Session[]>>((acc, session) => {
    const key = session.plannedStart.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], session] : [session];
    return acc;
  }, {});

  const result: Session[] = [];
  const restMinutesBase = settings.breakPreset.rest || 5;
  const breakLabel = settings.breakPreset.label || "Break";

  Object.values(byDay).forEach((daySessions) => {
    const ordered = [...daySessions].sort(
      (a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime(),
    );
    let offset = 0;
    ordered.forEach((session, index) => {
      const shiftedStart = addMinutes(new Date(session.plannedStart), offset);
      const shiftedEnd = addMinutes(new Date(session.plannedEnd), offset);
      const adjusted: Session = {
        ...session,
        plannedStart: shiftedStart.toISOString(),
        plannedEnd: shiftedEnd.toISOString(),
      };
      result.push(adjusted);

      if (session.source === "break") {
        return;
      }

      const next = ordered[index + 1];
      const isNextFocus = next && next.source !== "break";
      if (!isNextFocus) {
        return;
      }
      const gapMs = new Date(next.plannedStart).getTime() - new Date(session.plannedEnd).getTime();
      const consecutive = gapMs <= 5 * 60 * 1000; // coi như liền nhau nếu gap <=5 phút
      if (!consecutive) {
        return;
      }
      const contiguousLoad = session.minutes + next.minutes;
      const restMinutes = contiguousLoad >= 90 ? restMinutesBase + 5 : restMinutesBase;
      const breakStart = shiftedEnd;
      const breakEnd = addMinutes(breakStart, restMinutes);
      result.push({
        id: crypto.randomUUID(),
        source: "break",
        subject: "Nghỉ",
        title: breakLabel,
        plannedStart: breakStart.toISOString(),
        plannedEnd: breakEnd.toISOString(),
        minutes: restMinutes,
        bufferMinutes: 0,
        status: "pending",
        checklist: undefined,
        successCriteria: ["Nghỉ ngơi"],
        milestoneTitle: undefined,
        completedAt: null,
        planVersion,
      });
      offset += restMinutes;
    });
  });

  return result.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());
};

export function generatePlan(input: PlannerInput): PlannerOutput {
  const { tasks, freeSlots, habits, settings, nowIso, previousPlanVersion } = input;
  const now = new Date(nowIso);
  const { slots: cleanedSlots, warnings } = cleanSlots(freeSlots);
  const planVersion = (previousPlanVersion ?? 0) + 1;

  const futureTasks = tasks.filter((task) => new Date(task.deadline) > now);
  const prioritized = prioritizeTasks(futureTasks);
  let latestDeadline = prioritized.reduce(
    (maxDate, task) => {
      const deadline = new Date(task.deadline);
      return deadline > maxDate ? deadline : maxDate;
    },
    now,
  );

  if (prioritized.length === 0 && habits.length > 0) {
    latestDeadline = addDays(now, 14);
  }

  const buckets = buildBuckets(now, latestDeadline, cleanedSlots, settings).filter(
    (bucket) => bucket.segments.length > 0,
  );

  const { sessions: habitSessions, suggestions: habitSuggestions } = scheduleHabits(
    buckets,
    habits,
    settings,
    planVersion,
  );

  const totalCapacity = buckets.reduce((sum, bucket) => sum + bucket.allowedMinutes, 0);
  const totalDemand = prioritized.reduce(
    (sum, task) => sum + Math.max(0, task.estimatedMinutes - task.progressMinutes),
    0,
  );

  const suggestions: PlanSuggestion[] = [...habitSuggestions];
  if (totalCapacity < totalDemand) {
    suggestions.push({
      type: "increase_free_time",
      message: "Không đủ giờ rảnh để hoàn thành toàn bộ nhiệm vụ. Hãy thêm slot hoặc tăng daily limit.",
    });
  }

  warnings.forEach((warning) =>
    suggestions.push({ type: "increase_free_time", message: warning }),
  );

  const sessions: Session[] = [...habitSessions];
  const unscheduledTasks: Task[] = [];
  const focusChunk = settings.breakPreset.focus || 45;

  prioritized.forEach((task) => {
    let remaining = Math.max(0, task.estimatedMinutes - task.progressMinutes);
    const deadline = new Date(task.deadline);
    const eligibleBuckets = buckets.filter(
      (bucket) => new Date(`${bucket.isoDate}T23:59:00+07:00`) <= deadline,
    );
    if (eligibleBuckets.length === 0) {
      unscheduledTasks.push(task);
      suggestions.push({
        type: "increase_free_time",
        message: `Task "${task.title}" không nằm trong bất kỳ slot nào.`,
      });
      return;
    }

    const baseSuccessCriteria = (task.successCriteria && task.successCriteria.length > 0)
      ? task.successCriteria
      : ["Hoàn thành buổi học"];
    const checklist = task.contentFocus
      ? task.contentFocus
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
      : undefined;

    const allocateSession = (
      bucket: DayBucket,
      minutesNeeded: number,
      chunkPreference: number,
      milestoneTitle?: string,
    ) => {
      let localRemaining = minutesNeeded;
      let attempt = takeFromBucket(
        bucket,
        localRemaining,
        chunkPreference,
        { allowShorterThanMin: Boolean(milestoneTitle) },
      );
      while (attempt && localRemaining > 0) {
        const minutes = attempt.minutes;
        sessions.push({
          id: crypto.randomUUID(),
          taskId: task.id,
          source: "task",
          subject: task.subject,
          title: task.title,
          plannedStart: attempt.sessionStart.toISOString(),
          plannedEnd: attempt.sessionEnd.toISOString(),
          minutes,
          bufferMinutes: Math.round(minutes * settings.bufferPercent),
          status: "pending",
          checklist,
          successCriteria: baseSuccessCriteria,
          milestoneTitle,
          completedAt: null,
          planVersion,
        });
        remaining -= minutes;
        localRemaining -= minutes;
        attempt = localRemaining > 0
          ? takeFromBucket(
            bucket,
            localRemaining,
            chunkPreference,
            { allowShorterThanMin: Boolean(milestoneTitle) },
          )
          : null;
      }
      return localRemaining;
    };

    const milestoneChunks = task.milestones && task.milestones.length > 0 ? task.milestones : undefined;
    if (milestoneChunks) {
      milestoneChunks.forEach((milestone) => {
        let milestoneRemaining = Math.min(milestone.minutesEstimate, remaining);
        for (const bucket of eligibleBuckets) {
          if (milestoneRemaining <= 0) break;
          milestoneRemaining = allocateSession(bucket, milestoneRemaining, milestone.minutesEstimate, milestone.title);
        }
      });
    } else {
      for (const bucket of eligibleBuckets) {
        if (remaining <= 0) break;
        allocateSession(bucket, remaining, focusChunk);
      }
    }

    if (remaining > 0) {
      unscheduledTasks.push(task);
      suggestions.push({
        type: "reduce_duration",
        message: `Nhiệm vụ "${task.title}" thiếu ${remaining} phút. Giảm thời lượng hoặc thêm slot.`,
      });
    }
  });

  const sessionsWithBreaks = applyBreaks(sessions, settings, planVersion);
  const generatedAt = new Date().toISOString();

  return {
    planVersion,
    sessions: sessionsWithBreaks,
    unscheduledTasks,
    suggestions,
    generatedAt,
  } satisfies PlannerOutput;
}
