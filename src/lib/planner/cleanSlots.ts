import { FreeSlot } from "@/src/lib/types";

export type CleanSlotsResult = {
  slots: FreeSlot[];
  warnings: string[];
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const minutesToTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
};

export function cleanSlots(slots: FreeSlot[]): CleanSlotsResult {
  const warnings: string[] = [];
  const sanitized: FreeSlot[] = [];

  const grouped = slots.reduce<Record<number, FreeSlot[]>>((acc, slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);
    if (end <= start) {
      warnings.push(`Slot ${slot.startTime}-${slot.endTime} bị đảo giờ.`);
      return acc;
    }
    const duration = end - start;
    if (duration >= 720) {
      warnings.push(`Slot ${slot.startTime}-${slot.endTime} quá dài, đã giới hạn 180 phút.`);
    }
    const safeDuration = Math.min(duration, 180);
    const safeEnd = minutesToTime(start + safeDuration);
    const cleanSlot: FreeSlot = {
      ...slot,
      startTime: minutesToTime(start),
      endTime: safeEnd,
      capacityMinutes: safeDuration,
    };
    acc[slot.weekday] = acc[slot.weekday] ? [...acc[slot.weekday], cleanSlot] : [cleanSlot];
    return acc;
  }, {});

  Object.entries(grouped).forEach(([weekdayKey, weekdaySlots]) => {
    const sorted = weekdaySlots.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    let current = sorted[0];
    const beforeCount = sorted.length;
    for (let i = 1; i < sorted.length; i += 1) {
      const slot = sorted[i];
      if (toMinutes(slot.startTime) <= toMinutes(current.endTime)) {
        const mergedStart = toMinutes(current.startTime);
        const mergedEnd = Math.max(toMinutes(slot.endTime), toMinutes(current.endTime));
        current = {
          ...current,
          startTime: minutesToTime(mergedStart),
          endTime: minutesToTime(mergedEnd),
          capacityMinutes: mergedEnd - mergedStart,
        };
      } else {
        sanitized.push(current);
        current = slot;
      }
    }
    sanitized.push(current);
    const afterCount = sanitized.filter((slot) => slot.weekday === Number(weekdayKey)).length;
    if (afterCount < beforeCount) {
      warnings.push(`Đã gộp slot trùng trong ngày ${weekdayKey}`);
    }
  });

  return { slots: sanitized, warnings };
}
