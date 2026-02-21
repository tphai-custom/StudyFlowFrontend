"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { rebuildPlan, exportPlan } from "@/src/lib/planner/planService";
import { PlanRecord, Session } from "@/src/lib/types";
import { getSettings } from "@/src/lib/storage/settingsRepo";
import { getBrowserTimezone, getDayKeyFromDate, getDayKeyFromISO, getMonthKeyFromISO } from "@/src/lib/datetime";
import { getPlanMetrics, PlanMetrics } from "@/src/lib/storage/metricsRepo";

const views = [
  { key: "year", label: "Năm" },
  { key: "month", label: "Tháng" },
  { key: "week", label: "Tuần" },
  { key: "day", label: "Ngày" },
  { key: "timeline", label: "Lịch lớn" },
] as const;

type ViewKey = (typeof views)[number]["key"];

const groupSessions = (sessions: Session[], timeZone: string) => {
  return sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const key = getDayKeyFromISO(session.plannedStart, timeZone);
    acc[key] = acc[key] ? [...acc[key], session] : [session];
    return acc;
  }, {});
};

const normalizeSuccessCriteria = (criteria: Session["successCriteria"]) => {
  if (Array.isArray(criteria)) return criteria;
  if (criteria) return [criteria];
  return [];
};

export default function PlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [taskCount, setTaskCount] = useState<number>(0);
  const [slotCount, setSlotCount] = useState<number>(0);
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [view, setView] = useState<ViewKey>("week");
  const [status, setStatus] = useState("Chưa tạo kế hoạch");
  const [loading, setLoading] = useState(false);
  const browserTimezone = getBrowserTimezone();
  const [timezone, setTimezone] = useState<string>(browserTimezone);
  const [metricsRange, setMetricsRange] = useState<"day" | "week" | "month">("week");
  const [metrics, setMetrics] = useState<PlanMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [taskList, slotList, planRecord, appSettings] = await Promise.all([
        listTasks(),
        listSlots(),
        getLatestPlan(),
        getSettings(),
      ]);
      setTaskCount(taskList.length);
      setSlotCount(slotList.length);
      setPlan(planRecord);
      if (planRecord) {
        setStatus(`Plan v${planRecord.planVersion}`);
      }
      setTimezone(appSettings.timezone ?? browserTimezone);
    })();
  }, [browserTimezone]);

  useEffect(() => {
    const requestedView = (searchParams?.get("view") as ViewKey) ?? "week";
    setView(requestedView);
  }, [searchParams]);

  useEffect(() => {
    const todayKey = getDayKeyFromDate(new Date(), timezone);
    setMetricsLoading(true);
    getPlanMetrics(metricsRange, todayKey)
      .then(setMetrics)
      .catch(() => setMetrics(null))
      .finally(() => setMetricsLoading(false));
  }, [metricsRange, timezone]);

  const groupedSessions = useMemo(() => {
    const focusSessions = plan?.sessions.filter((session) => session.source !== "break") ?? [];
    return groupSessions(focusSessions, timezone);
  }, [plan, timezone]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (taskCount === 0) {
        setStatus("⚠️ Cần ít nhất 1 task");
        return;
      }
      if (slotCount === 0) {
        setStatus("⚠️ Cần giờ rảnh");
        return;
      }
      const newPlan = await rebuildPlan();
      if (!newPlan) {
        setStatus("Thiếu dữ liệu để tạo kế hoạch. Kiểm tra task + slot.");
        return;
      }
      const focusSessions = newPlan.sessions.filter((session) => session.source !== "break");
      setStatus(`Đã tạo ${focusSessions.length} phiên học/ thói quen`);
      const sortedSessions = [...newPlan.sessions].sort((a, b) =>
        a.plannedStart.localeCompare(b.plannedStart),
      );
      console.info("[PLAN_CREATE]", {
        totalSessions: newPlan.sessions.length,
        focusSessions: focusSessions.length,
        firstSession: sortedSessions[0]?.plannedStart ?? null,
        lastSession: sortedSessions.at(-1)?.plannedEnd ?? sortedSessions.at(-1)?.plannedStart ?? null,
        timezone,
        storage: typeof window !== "undefined" && "indexedDB" in window ? "indexedDB" : "localStorage",
      });
      setPlan(newPlan);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không tạo được kế hoạch");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSwitch = (nextView: ViewKey) => {
    setView(nextView);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("view", nextView);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const renderView = () => {
    if (!plan) {
      return <p className="text-sm text-zinc-400">Chưa có kế hoạch. Nhấn “Tạo kế hoạch”.</p>;
    }

    const focusSessions = plan.sessions.filter((session) => session.source !== "break");

    if (view === "year") {
      const months = focusSessions.reduce<Record<string, number>>((acc, session) => {
        const key = getMonthKeyFromISO(session.plannedStart, timezone);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      return (
        <div className="grid-auto">
          {Object.entries(months).map(([month, count]) => (
            <div
              key={month}
              className="rounded-lg border border-zinc-700/60 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              title="Nhấn để xem theo tuần"
              onClick={() => handleViewSwitch("week")}
            >
              <p className="text-sm text-zinc-400">{month}</p>
              <p className="text-2xl font-bold">{count} sessions</p>
              <p className="text-xs text-zinc-500 mt-1">Nhấn → Xem tuần</p>
            </div>
          ))}
        </div>
      );
    }

    if (view === "month" || view === "week") {
      const todayKey = getDayKeyFromDate(new Date(), timezone);
      const allEntries = Object.entries(groupedSessions).sort((a, b) => a[0].localeCompare(b[0]));
      const displayEntries =
        view === "week"
          ? allEntries.filter(([day]) => day >= todayKey).slice(0, 7)
          : allEntries.slice(0, 30);
      return (
        <div className="space-y-3">
          {displayEntries.length === 0 && (
            <p className="text-sm text-zinc-400">
              {view === "week" ? "Không có phiên học nào trong 7 ngày tới." : "Không có phiên học nào."}
            </p>
          )}
          {displayEntries.map(([day, daySessions]) => (
            <div
              key={day}
              className="rounded-lg border border-zinc-700/60 p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
              title="Nhấn để xem chi tiết ngày này"
              onClick={() => handleViewSwitch("day")}
            >
              <p className="text-sm text-zinc-400">{day}</p>
              <ul className="mt-2 space-y-2">
                {daySessions.map((session) => {
                  const successCriteriaList = normalizeSuccessCriteria(session.successCriteria);
                  return (
                    <li key={session.id} className="flex flex-col gap-1 rounded-lg border border-zinc-800/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase text-zinc-500">
                            {session.source === "habit" ? "Habit" : session.subject}
                          </p>
                          <p className="font-semibold">
                            {session.title}
                            {session.milestoneTitle ? ` · ${session.milestoneTitle}` : ""}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {format(new Date(session.plannedStart), "HH:mm")} · {session.minutes}p
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300">
                        Học gì – đạt gì: {successCriteriaList.length ? successCriteriaList.join(", ") : "Chưa có tiêu chí"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    if (view === "day") {
      const todayKey = getDayKeyFromDate(new Date(), timezone);
      const todaySessions = groupedSessions[todayKey] ?? [];
      return todaySessions.length === 0 ? (
        <p className="text-sm text-zinc-400">Hôm nay không có session nào.</p>
      ) : (
        <ul className="space-y-2">
          {todaySessions.map((session) => {
            const successCriteriaList = normalizeSuccessCriteria(session.successCriteria);
            return (
              <li key={session.id} className="rounded-lg border border-zinc-700/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    {session.milestoneTitle && (
                      <p className="text-xs text-sky-300">Milestone: {session.milestoneTitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {session.source === "habit" ? "Habit" : session.subject}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {format(new Date(session.plannedStart), "HH:mm")} · {session.minutes} phút · Buffer {session.bufferMinutes} phút
                </p>
                <p className="text-xs text-emerald-300">
                  Đạt gì: {successCriteriaList.length ? successCriteriaList.join(", ") : "Chưa có tiêu chí"}
                </p>
              </li>
            );
          })}
        </ul>
      );
    }

    if (view === "timeline") {
      const monthly = focusSessions.reduce<
        Record<string, { minutes: number; subjects: Record<string, number> }>
      >((acc, session) => {
        const key = getMonthKeyFromISO(session.plannedStart, timezone);
        if (!acc[key]) {
          acc[key] = { minutes: 0, subjects: {} };
        }
        acc[key].minutes += session.minutes;
        acc[key].subjects[session.subject] = (acc[key].subjects[session.subject] ?? 0) + session.minutes;
        return acc;
      }, {});
      return (
        <div className="space-y-3">
          {Object.entries(monthly).map(([month, info]) => (
            <div key={month} className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Tháng {month}</p>
                <p className="text-xs text-zinc-400">{info.minutes} phút đã xếp</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                {Object.entries(info.subjects).map(([subject, minutes]) => (
                  <span key={`${month}-${subject}`} className="rounded-full border border-zinc-700 px-3 py-1">
                    {subject}: {minutes}p
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              onClick={() => exportPlan(plan, `studyflow-v${plan.planVersion}.ics`)}
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
              onClick={() => handleViewSwitch(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs">
          <p className="text-zinc-500">
            Chọn tab để xem kế hoạch theo Năm/Tháng/Tuần/Ngày. Bấm vào các mục để xem theo cấp (tổng quan → chi tiết).
          </p>
          <p className="text-sky-300">
            💡 Xem theo cấp: Bấm từ lịch tuần để mở chi tiết ngày, bấm vào phiên học để xem chi tiết nhiệm vụ.
          </p>
        </div>
        {renderView()}
      </section>

      {/* B1: Plan Quality Metrics Section */}
      <section className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Chất lượng kế hoạch</h2>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((r) => (
              <button
                key={r}
                className={`rounded-full px-3 py-1 text-xs ${metricsRange === r ? "bg-sky-500 text-black" : "bg-zinc-800 text-zinc-300"}`}
                onClick={() => setMetricsRange(r)}
              >
                {r === "day" ? "Ngày" : r === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>
        {metricsLoading ? (
          <p className="text-sm text-zinc-500">Đang tải chỉ số...</p>
        ) : !metrics || metrics.planVersion === null ? (
          <p className="text-sm text-zinc-500">Chưa có kế hoạch để đánh giá. Hãy tạo kế hoạch trước.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Completion Rate Card */}
            <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Tỷ lệ hoàn thành</p>
              <p className={`text-3xl font-bold ${metrics.completionRate >= 70 ? "text-emerald-400" : metrics.completionRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {metrics.completionRate}%
              </p>
              <p className="text-sm text-zinc-400">{metrics.doneSessions}/{metrics.totalSessions} phiên đã hoàn thành</p>
              <div className="h-2 w-full rounded-full bg-zinc-700">
                <div
                  className={`h-2 rounded-full transition-all ${metrics.completionRate >= 70 ? "bg-emerald-500" : metrics.completionRate >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(metrics.completionRate, 100)}%` }}
                />
              </div>
            </div>
            {/* Feasibility Score Card */}
            <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Điểm khả thi</p>
              <p className={`text-3xl font-bold ${metrics.feasibilityScore >= 70 ? "text-emerald-400" : metrics.feasibilityScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {metrics.feasibilityScore}<span className="text-base font-normal text-zinc-500">/100</span>
              </p>
              <div className="h-2 w-full rounded-full bg-zinc-700">
                <div
                  className={`h-2 rounded-full transition-all ${metrics.feasibilityScore >= 70 ? "bg-emerald-500" : metrics.feasibilityScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${metrics.feasibilityScore}%` }}
                />
              </div>
              {metrics.feasibilityReasons.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {metrics.feasibilityReasons.map((reason, i) => (
                    <li key={i} className="text-xs text-zinc-400">• {reason}</li>
                  ))}
                </ul>
              )}
              {metrics.feasibilityReasons.length === 0 && (
                <p className="text-xs text-emerald-400">✓ Kế hoạch khả thi, không có vấn đề phát hiện</p>
              )}
            </div>
          </div>
        )}
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
