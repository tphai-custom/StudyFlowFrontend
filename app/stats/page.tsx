"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { PlanRecord, Task } from "@/src/lib/types";

export default function StatsPage() {
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const [planRecord, taskList] = await Promise.all([getLatestPlan(), listTasks()]);
      setPlan(planRecord);
      setTasks(taskList);
    })();
  }, []);

  const weekRange = useMemo(() => {
    const start = new Date();
    const end = addDays(start, 7);
    return { start, end };
  }, []);

  const stats = useMemo(() => {
    if (!plan) {
      return { weekMinutes: 0, dayMinutes: 0, completion: 0, subjectBreakdown: {} as Record<string, number> };
    }
    const todayKey = new Date().toISOString().slice(0, 10);
    const weekMinutes = plan.sessions
      .filter((session) => {
        const date = new Date(session.plannedStart);
        return date >= weekRange.start && date <= weekRange.end;
      })
      .reduce((sum, session) => sum + session.minutes, 0);
    const dayMinutes = plan.sessions
      .filter((session) => session.plannedStart.startsWith(todayKey))
      .reduce((sum, session) => sum + session.minutes, 0);
    const subjectBreakdown = plan.sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.subject] = (acc[session.subject] ?? 0) + session.minutes;
      return acc;
    }, {});
    const completion = plan.sessions.length
      ? Math.round((plan.sessions.filter((session) => session.status === "done").length / plan.sessions.length) * 100)
      : 0;
    return { weekMinutes, dayMinutes, subjectBreakdown, completion };
  }, [plan, weekRange]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Thống kê & drilldown</h1>
        <p className="text-sm text-zinc-400">Theo dõi phút học theo ngày/tuần và từng môn.</p>
      </header>
      <section className="grid-auto">
        <div className="card">
          <p className="text-sm text-zinc-400">Tổng phút tuần</p>
          <p className="text-3xl font-bold">{stats.weekMinutes}</p>
          <p className="text-xs text-zinc-500">
            {format(weekRange.start, "dd/MM")} - {format(weekRange.end, "dd/MM")}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Hôm nay</p>
          <p className="text-3xl font-bold">{stats.dayMinutes} phút</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Completion rate</p>
          <p className="text-3xl font-bold">{stats.completion}%</p>
        </div>
      </section>
      <section className="card space-y-3">
        <h2 className="font-semibold">Phân bổ theo môn</h2>
        {Object.keys(stats.subjectBreakdown).length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có dữ liệu.</p>
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
