"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { getSettings } from "@/src/lib/storage/settingsRepo";
import { getLatestPlan, savePlan } from "@/src/lib/storage/planRepo";
import { listFeedback } from "@/src/lib/storage/feedbackRepo";
import { generatePlan } from "@/src/lib/planner/generatePlan";
import { downloadIcs } from "@/src/lib/planner/icsExport";
import { Task, FreeSlot, PlanRecord, Session } from "@/src/lib/types";

const views = [
  { key: "year", label: "Năm" },
  { key: "month", label: "Tháng" },
  { key: "week", label: "Tuần" },
  { key: "day", label: "Ngày" },
] as const;

type ViewKey = (typeof views)[number]["key"];

const groupSessions = (sessions: Session[]) => {
  return sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const key = session.plannedStart.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], session] : [session];
    return acc;
  }, {});
};

export default function PlanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [view, setView] = useState<ViewKey>("week");
  const [status, setStatus] = useState("Chưa tạo kế hoạch");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [taskList, slotList, planRecord] = await Promise.all([
        listTasks(),
        listSlots(),
        getLatestPlan(),
      ]);
      setTasks(taskList);
      setSlots(slotList);
      setPlan(planRecord);
      if (planRecord) {
        setStatus(`Plan v${planRecord.planVersion}`);
      }
    })();
  }, []);

  const groupedSessions = useMemo(() => groupSessions(plan?.sessions ?? []), [plan]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (tasks.length === 0) {
        setStatus("⚠️ Cần ít nhất 1 task");
        return;
      }
      if (slots.length === 0) {
        setStatus("⚠️ Cần giờ rảnh");
        return;
      }
      const [settings, feedback] = await Promise.all([getSettings(), listFeedback()]);
      const latestFeedback = feedback.at(-1);
      const tunedSettings = { ...settings, breakPreset: { ...settings.breakPreset } };
      if (latestFeedback?.label === "too_dense") {
        tunedSettings.bufferPercent = Math.min(0.5, tunedSettings.bufferPercent + 0.1);
      }
      if (latestFeedback?.label === "too_easy") {
        tunedSettings.bufferPercent = Math.max(0.05, tunedSettings.bufferPercent - 0.05);
      }
      if (latestFeedback?.label === "need_more_time") {
        tunedSettings.dailyLimitMinutes = Math.min(600, tunedSettings.dailyLimitMinutes + 30);
      }
      const newPlan = generatePlan({
        tasks,
        freeSlots: slots,
        settings: tunedSettings,
        nowIso: new Date().toISOString(),
        previousPlanVersion: plan?.planVersion,
      });
      if (newPlan.sessions.length === 0) {
        setStatus("Không đủ thời gian. Xem gợi ý bên dưới.");
      } else {
        setStatus(`Đã tạo ${newPlan.sessions.length} phiên học`);
      }
      setPlan(newPlan);
      await savePlan(newPlan);
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    if (!plan) {
      return <p className="text-sm text-zinc-400">Chưa có kế hoạch. Nhấn “Tạo kế hoạch”.</p>;
    }

    if (view === "year") {
      const months = plan.sessions.reduce<Record<string, number>>((acc, session) => {
        const key = session.plannedStart.slice(0, 7);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      return (
        <div className="grid-auto">
          {Object.entries(months).map(([month, count]) => (
            <div key={month} className="rounded-lg border border-zinc-700/60 p-4">
              <p className="text-sm text-zinc-400">{month}</p>
              <p className="text-2xl font-bold">{count} sessions</p>
            </div>
          ))}
        </div>
      );
    }

    if (view === "month" || view === "week") {
      return (
        <div className="space-y-3">
          {Object.entries(groupedSessions)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(0, view === "week" ? 7 : 30)
            .map(([day, daySessions]) => (
              <div key={day} className="rounded-lg border border-zinc-700/60 p-4">
                <p className="text-sm text-zinc-400">{day}</p>
                <ul className="mt-2 space-y-2">
                  {daySessions.map((session) => (
                    <li key={session.id} className="flex items-center justify-between text-sm">
                      <span>
                        <strong>{session.subject}</strong> {session.title}
                      </span>
                      <span>{format(new Date(session.plannedStart), "HH:mm")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      );
    }

    if (view === "day") {
      const todayKey = new Date().toISOString().slice(0, 10);
      const todaySessions = groupedSessions[todayKey] ?? [];
      return todaySessions.length === 0 ? (
        <p className="text-sm text-zinc-400">Hôm nay không có session nào.</p>
      ) : (
        <ul className="space-y-2">
          {todaySessions.map((session) => (
            <li key={session.id} className="rounded-lg border border-zinc-700/60 p-3">
              <p className="font-semibold">{session.title}</p>
              <p className="text-xs text-zinc-400">
                {format(new Date(session.plannedStart), "HH:mm")} · {session.minutes} phút · Buffer {session.bufferMinutes} phút
              </p>
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trình tạo kế hoạch</h1>
          <p className="text-sm text-zinc-400">Tính khả thi trước khi sắp lịch. Giữ buffer để tránh nhồi.</p>
          <p className="text-sm text-emerald-400">{status}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo kế hoạch"}
          </button>
          {plan && (
            <button
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm"
              onClick={() => downloadIcs(plan, `studyflow-v${plan.planVersion}.ics`)}
            >
              Xuất .ics
            </button>
          )}
        </div>
      </header>
      <section className="card space-y-3">
        <div className="flex gap-2">
          {views.map((tab) => (
            <button
              key={tab.key}
              className={`rounded-full px-4 py-1 text-sm ${
                view === tab.key ? "bg-emerald-500 text-black" : "bg-zinc-800"
              }`}
              onClick={() => setView(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {renderView()}
      </section>
      {plan && plan.unscheduledTasks.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Không đủ thời gian cho</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-300">
            {plan.unscheduledTasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </section>
      )}
      {plan && plan.suggestions.length > 0 && (
        <section className="card space-y-2">
          <h2 className="font-semibold">Gợi ý điều chỉnh</h2>
          {plan.suggestions.map((suggestion, index) => (
            <p key={`${suggestion.type}-${index}`} className="text-sm text-zinc-300">
              • {suggestion.message}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
