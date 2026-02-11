"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Task, Session } from "@/src/lib/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [slotsCount, setSlotsCount] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    (async () => {
      const [taskList, slotList, plan] = await Promise.all([
        listTasks(),
        listSlots(),
        getLatestPlan(),
      ]);
      setTasks(taskList);
      setSlotsCount(slotList.length);
      if (plan) {
        const futureSessions = plan.sessions
          .filter((session) => new Date(session.plannedStart) > new Date())
          .slice(0, 4);
        setUpcomingSessions(futureSessions);
        const done = plan.sessions.filter((session) => session.status === "done").length;
        setCompletionRate(plan.sessions.length ? Math.round((done / plan.sessions.length) * 100) : 0);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-zinc-400 uppercase">Tổng quan</p>
        <h1 className="text-3xl font-semibold">StudyFlow dashboard</h1>
        <p className="text-sm text-zinc-400">Nắm nhanh nhiệm vụ, slot rảnh và phiên học sắp tới.</p>
      </header>
      <section className="grid-auto">
        <div className="card">
          <p className="text-sm text-zinc-400">Tasks đang mở</p>
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Slot rảnh hợp lệ</p>
          <p className="text-3xl font-bold text-white">{slotsCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Completion rate</p>
          <p className="text-3xl font-bold text-white">{completionRate}%</p>
        </div>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Phiên học sắp tới</h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có kế hoạch. Hãy vào trang Trình tạo kế hoạch.</p>
        ) : (
          <ul className="space-y-3">
            {upcomingSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3"
              >
                <div>
                  <p className="text-sm text-zinc-300">{session.subject}</p>
                  <p className="font-semibold">{session.title}</p>
                </div>
                <span className="text-sm text-zinc-400">
                  {format(new Date(session.plannedStart), "dd/MM HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
