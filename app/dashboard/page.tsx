"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Task, Session } from "@/src/lib/types";
import { Tooltip } from "@/src/components/Tooltip";

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

  // Determine next step suggestion
  const getNextStepSuggestion = () => {
    if (tasks.length === 0) {
      return {
        title: "Thêm nhiệm vụ đầu tiên",
        description: "Bắt đầu bằng cách tạo nhiệm vụ học tập với deadline",
        href: "/tasks",
        icon: "📝",
      };
    }
    if (slotsCount === 0) {
      return {
        title: "Nhập thời gian rảnh",
        description: "Cho hệ thống biết bạn có những khung giờ nào để học",
        href: "/free-time",
        icon: "⏰",
      };
    }
    if (!plan) {
      return {
        title: "Tạo kế hoạch",
        description: "Hệ thống sẽ tự động xếp lịch các phiên học cho bạn",
        href: "/plan",
        icon: "📅",
      };
    }
    return {
      title: "Xem phiên học hôm nay",
      description: "Kiểm tra các phiên học đã được xếp cho hôm nay",
      href: "/today",
      icon: "🎯",
    };
  };

  const nextStep = getNextStepSuggestion();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-zinc-400 uppercase">Tổng quan</p>
        <h1 className="text-3xl font-semibold">StudyFlow dashboard</h1>
        <p className="text-sm text-zinc-400">Nắm nhanh nhiệm vụ, slot rảnh và phiên học sắp tới.</p>
      </header>

      {/* What should I do today? */}
      <section className="card border-emerald-500/40 bg-emerald-500/5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{nextStep.icon}</span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Hôm nay nên làm gì?</h2>
            <p className="text-sm text-zinc-400 mb-3">{nextStep.description}</p>
            <Link
              href={nextStep.href}
              className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              {nextStep.title} →
            </Link>
          </div>
        </div>
      </section>

      <section className="grid-auto">
        <div className="card">
          <Tooltip content="Nhiệm vụ học tập - công việc cần hoàn thành có deadline">
            <p className="text-sm text-zinc-400">Tasks đang mở</p>
          </Tooltip>
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="card">
          <Tooltip content="Các khung giờ trống đã được làm sạch (gộp, cắt) để xếp lịch">
            <p className="text-sm text-zinc-400">Slot rảnh hợp lệ</p>
          </Tooltip>
          <p className="text-3xl font-bold text-white">{slotsCount}</p>
        </div>
        <div className="card">
          <Tooltip content="Tỷ lệ hoàn thành - % phiên học đã hoàn tất so với tổng số">
            <p className="text-sm text-zinc-400">Completion rate</p>
          </Tooltip>
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
