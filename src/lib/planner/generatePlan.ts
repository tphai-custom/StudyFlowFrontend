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
  BreakSession,
  FreeSlot,
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
): { sessionStart: Date; sessionEnd: Date; minutes: number } | null => {
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
    if (chunk < MIN_SESSION_MINUTES && remaining > MIN_SESSION_MINUTES) {
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

export function generatePlan(input: PlannerInput): PlannerOutput {
  const { tasks, freeSlots, settings, nowIso, previousPlanVersion } = input;
  const now = new Date(nowIso);
  const { slots: cleanedSlots, warnings } = cleanSlots(freeSlots);
  const planVersion = (previousPlanVersion ?? 0) + 1;

  const futureTasks = tasks.filter((task) => new Date(task.deadline) > now);
  const prioritized = prioritizeTasks(futureTasks);
  const latestDeadline = prioritized.reduce(
    (maxDate, task) => {
      const deadline = new Date(task.deadline);
      return deadline > maxDate ? deadline : maxDate;
    },
    now,
  );

  const buckets = buildBuckets(now, latestDeadline, cleanedSlots, settings).filter(
    (bucket) => bucket.segments.length > 0,
  );

  const totalCapacity = buckets.reduce((sum, bucket) => sum + bucket.allowedMinutes, 0);
  const totalDemand = prioritized.reduce(
    (sum, task) => sum + Math.max(0, task.estimatedMinutes - task.progressMinutes),
    0,
  );

  const suggestions: PlanSuggestion[] = [];
  if (totalCapacity < totalDemand) {
    suggestions.push({
      type: "increase_free_time",
      message: "Không đủ giờ rảnh để hoàn thành toàn bộ nhiệm vụ. Hãy thêm slot hoặc tăng daily limit.",
    });
  }

  warnings.forEach((warning) =>
    suggestions.push({ type: "increase_free_time", message: warning }),
  );

  const sessions: Session[] = [];
  const unscheduledTasks: Task[] = [];
  const focusChunk = settings.breakPreset.focus || 45;

  prioritized.forEach((task) => {
    let remaining = Math.max(0, task.estimatedMinutes - task.progressMinutes);
    const deadline = new Date(task.deadline);
    const eligibleBuckets = buckets.filter(
      (bucket) => new Date(`${bucket.isoDate}T23:59:00+07:00`) <= deadline,
    );
    for (const bucket of eligibleBuckets) {
      if (remaining <= 0) break;
      let attempt = takeFromBucket(bucket, remaining, focusChunk);
      while (attempt && remaining > 0) {
        sessions.push({
          id: crypto.randomUUID(),
          taskId: task.id,
          subject: task.subject,
          title: task.title,
          plannedStart: attempt.sessionStart.toISOString(),
          plannedEnd: attempt.sessionEnd.toISOString(),
          minutes: attempt.minutes,
          bufferMinutes: Math.round(attempt.minutes * settings.bufferPercent),
          status: "pending",
          checklist: task.contentFocus
            ? ["Xem nội dung", "Ghi chú chính", "Làm bài tập ngắn"]
            : undefined,
          successCriteria: task.successCriteria,
          planVersion,
        });
        remaining -= attempt.minutes;
        attempt = takeFromBucket(bucket, remaining, focusChunk);
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

  const breaks: BreakSession[] = [];
  const breakMinutes = settings.breakPreset.rest || 5;
  if (breakMinutes > 0) {
    const sessionsByDay = sessions.reduce<Record<string, Session[]>>((acc, session) => {
      const dayKey = session.plannedStart.slice(0, 10);
      acc[dayKey] = acc[dayKey] ? [...acc[dayKey], session] : [session];
      return acc;
    }, {});

    Object.entries(sessionsByDay).forEach(([dayKey, daySessions]) => {
      const ordered = daySessions.sort(
        (a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime(),
      );
      for (let i = 0; i < ordered.length - 1; i += 1) {
        const current = ordered[i];
        breaks.push({
          id: crypto.randomUUID(),
          label: settings.breakPreset.label,
          plannedStart: current.plannedEnd,
          plannedEnd: addMinutes(new Date(current.plannedEnd), breakMinutes).toISOString(),
          minutes: breakMinutes,
          attachedToSessionId: current.id,
          planVersion,
        });
      }
    });
  }

  const generatedAt = new Date().toISOString();

  return {
    planVersion,
    sessions,
    breaks,
    unscheduledTasks,
    suggestions,
    generatedAt,
  } satisfies PlannerOutput;
}
