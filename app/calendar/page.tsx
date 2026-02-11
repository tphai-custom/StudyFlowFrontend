"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Session } from "@/src/lib/types";

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    (async () => {
      const plan = await getLatestPlan();
      setSessions(plan?.sessions ?? []);
    })();
  }, []);

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const sessionsByDay = useMemo(() => {
    return sessions.reduce<Record<string, Session[]>>((acc, session) => {
      const key = session.plannedStart.slice(0, 10);
      acc[key] = acc[key] ? [...acc[key], session] : [session];
      return acc;
    }, {});
  }, [sessions]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lịch lớn</h1>
          <p className="text-sm text-zinc-400">Xem tuần hiện tại dạng lưới như Google Calendar.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-zinc-600 px-3 py-1"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ← Tuần trước
          </button>
          <button
            className="rounded-xl border border-zinc-600 px-3 py-1"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            Tuần sau →
          </button>
        </div>
      </header>
      <section className="card overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const daySessions = sessionsByDay[key] ?? [];
              return (
                <div key={key} className="rounded-lg border border-zinc-700/60 p-3">
                  <p className="text-sm font-semibold">
                    {format(day, "EEE dd/MM")}
                  </p>
                  {daySessions.length === 0 ? (
                    <p className="mt-2 text-xs text-zinc-500">Trống</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {daySessions.map((session) => (
                        <li key={session.id} className="rounded-lg border border-zinc-600/40 bg-zinc-900/40 p-2 text-xs">
                          <p className="font-semibold">{session.subject}</p>
                          <p>{session.title}</p>
                          <p className="text-[11px] text-zinc-500">
                            {format(new Date(session.plannedStart), "HH:mm")} · {session.minutes} phút
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
