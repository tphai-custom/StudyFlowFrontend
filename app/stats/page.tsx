"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { PlanRecord, Task } from "@/src/lib/types";
import { getSettings } from "@/src/lib/storage/settingsRepo";
import { getBrowserTimezone, getDayKeyFromDate, getDayKeyFromISO } from "@/src/lib/datetime";

const VIEW_LABEL = {
  week: "tuần",
  month: "tháng",
  year: "năm",
} as const;

export default function StatsPage() {
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statsView, setStatsView] = useState<"week" | "month" | "year">("week");
  const [includePlanned, setIncludePlanned] = useState(false);
  const browserTimezone = getBrowserTimezone();
  const [timezone, setTimezone] = useState(browserTimezone);

  useEffect(() => {
    (async () => {
      const [planRecord, taskList, appSettings] = await Promise.all([getLatestPlan(), listTasks(), getSettings()]);
      setPlan(planRecord);
      setTasks(taskList);
      setTimezone(appSettings.timezone ?? browserTimezone);
    })();
  }, [browserTimezone]);

  const range = useMemo(() => {
    const now = new Date();
    if (statsView === "month") {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    if (statsView === "year") {
      return { start: startOfYear(now), end: endOfYear(now) };
    }
    return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  }, [statsView]);

  const stats = useMemo(() => {
    if (!plan) {
      return {
        totalMinutesRange: 0,
        completion: 0,
        subjectBreakdown: {} as Record<string, number>,
        todayMinutes: 0,
        totalSessions: 0,
        completedSessions: 0,
      };
    }
    const focusSessions = plan.sessions.filter((session) => session.source !== "break");
    const sessionsInRange = focusSessions.filter((session) => {
      const date = new Date(session.plannedStart);
      return isWithinInterval(date, { start: range.start, end: range.end });
    });
    const completedSessions = sessionsInRange.filter((session) => session.status === "done" && session.completedAt);
    const minutesDataset = (includePlanned ? sessionsInRange : completedSessions).reduce(
      (sum, session) => sum + session.minutes,
      0,
    );
    const breakdownSource = includePlanned ? sessionsInRange : completedSessions;
    const subjectBreakdown = breakdownSource.reduce<Record<string, number>>((acc, session) => {
      acc[session.subject] = (acc[session.subject] ?? 0) + session.minutes;
      return acc;
    }, {});
    const completion = sessionsInRange.length
      ? Math.round((completedSessions.length / sessionsInRange.length) * 100)
      : 0;
    const todayKey = getDayKeyFromDate(new Date(), timezone);
    const todayMinutes = focusSessions
      .filter((session) => getDayKeyFromISO(session.plannedStart, timezone) === todayKey)
      .filter((session) => (includePlanned ? true : session.status === "done" && session.completedAt))
      .reduce((sum, session) => sum + session.minutes, 0);
    return {
      totalMinutesRange: minutesDataset,
      completion,
      subjectBreakdown,
      todayMinutes,
      totalSessions: sessionsInRange.length,
      completedSessions: completedSessions.length,
    };
  }, [plan, range, includePlanned, timezone]);

  const rangeLabel = `${format(range.start, "dd/MM")} - ${format(range.end, "dd/MM")}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Thống kê & drilldown</h1>
        <p className="text-sm text-zinc-400">Theo dõi phút học theo ngày/tuần và từng môn.</p>
      </header>
      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["week", "month", "year"].map((key) => (
              <button
                key={key}
                className={`rounded-full px-3 py-1 text-xs ${
                  statsView === key ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-200"
                }`}
                onClick={() => setStatsView(key as typeof statsView)}
              >
                {key === "week" ? "Tuần" : key === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              className="rounded border border-zinc-600 bg-transparent"
              checked={includePlanned}
              onChange={(event) => setIncludePlanned(event.target.checked)}
            />
            Bao gồm cả phiên chưa tick
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-400">Phút trong {VIEW_LABEL[statsView]}</p>
            <p className="text-3xl font-bold">{stats.totalMinutesRange}</p>
            <p className="text-xs text-zinc-500">{rangeLabel}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Hôm nay</p>
            <p className="text-3xl font-bold">{stats.todayMinutes} phút</p>
            <p className="text-xs text-zinc-500">{includePlanned ? "Đã lên lịch" : "Đã tick"}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Completion rate</p>
            <p className="text-3xl font-bold">{stats.completion}%</p>
            <p className="text-xs text-zinc-500">
              {stats.completedSessions}/{stats.totalSessions} phiên
            </p>
          </div>
        </div>
      </section>
      <section className="card space-y-3">
        <h2 className="font-semibold">Phân bổ theo môn</h2>
        {!includePlanned && stats.completedSessions === 0 ? (
          <p className="text-sm text-zinc-400">Bạn chưa hoàn thành phiên nào trong {VIEW_LABEL[statsView]} này.</p>
        ) : Object.keys(stats.subjectBreakdown).length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có dữ liệu cho phạm vi này.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(stats.subjectBreakdown).map(([subject, minutes]) => (
              <li key={subject} className="flex items-center justify-between text-sm">
                <span>{subject}</span>
                <span>{minutes} phút</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card space-y-2">
        <h2 className="font-semibold">Tiến độ từng task</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có task.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => {
              const scheduled = plan?.sessions
                .filter((session) => session.taskId === task.id)
                .reduce((sum, session) => sum + session.minutes, 0) ?? 0;
              return (
                <li key={task.id} className="rounded-lg border border-zinc-700/60 p-3">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-zinc-500">
                    Đã lên lịch {scheduled}/{task.estimatedMinutes} phút · Deadline {new Date(task.deadline).toLocaleDateString("vi-VN")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
