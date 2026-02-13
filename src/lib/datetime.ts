import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@/src/lib/types";

export function getBrowserTimezone(): string {
  if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat === "undefined") {
    return APP_TIMEZONE;
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? APP_TIMEZONE;
}

export function getDayKeyFromDate(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, "yyyy-MM-dd");
}

export function getDayKeyFromISO(isoString: string, timeZone: string): string {
  return getDayKeyFromDate(new Date(isoString), timeZone);
}

export function getMonthKeyFromISO(isoString: string, timeZone: string): string {
  return formatInTimeZone(new Date(isoString), timeZone, "yyyy-MM");
}
