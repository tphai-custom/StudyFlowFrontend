import { formatInTimeZone } from "date-fns-tz";
import { PlannerOutput } from "@/src/lib/types";

const CRLF = "\r\n";

const palette = ["#6EE7B7", "#93C5FD", "#FCD34D", "#FCA5A5", "#C4B5FD", "#F9A8D4"];

const getColorForSubject = (subject: string) => {
  const index = Math.abs(subject.split(" ").reduce((sum, word) => sum + word.charCodeAt(0), 0)) % palette.length;
  return palette[index];
};

const formatDate = (iso: string) => formatInTimeZone(iso, "UTC", "yyyyMMdd'T'HHmmss'Z'");

export function planToIcs(plan: PlannerOutput): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//StudyFlow//Planner 1.0//VI");
  lines.push("CALSCALE:GREGORIAN");

  plan.sessions
    .filter((session) => session.source !== "break")
    .forEach((session) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${session.id}@studyflow`);
    lines.push(`DTSTAMP:${formatDate(plan.generatedAt)}`);
    lines.push(`DTSTART:${formatDate(session.plannedStart)}`);
    lines.push(`DTEND:${formatDate(session.plannedEnd)}`);
    lines.push(`SUMMARY:${session.subject} · ${session.title}`);
      const description = session.successCriteria?.join(" • ") ?? "Hoàn thành buổi học";
      lines.push(`DESCRIPTION:${description}`);
    lines.push(`CATEGORIES:${session.subject}`);
    lines.push(`COLOR:${getColorForSubject(session.subject)}`);
    lines.push("END:VEVENT");
    });

  lines.push("END:VCALENDAR");
  return lines.join(CRLF);
}

export function downloadIcs(plan: PlannerOutput, filename = "studyflow.ics") {
  const blob = new Blob([planToIcs(plan)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
