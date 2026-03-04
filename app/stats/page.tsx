"use client";

import { useEffect, useState } from "react";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { PlanRecord, Task } from "@/src/lib/types";
import { getReportDay, getReportWeek, DayReport, WeekReport, ReportItem } from "@/src/lib/api/reports";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentWeekIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const diffMs = now.getTime() - jan4.getTime();
  const week = Math.ceil((diffMs / 86400000 + jan4.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompletionBar({ rate, size = "lg" }: { rate: number; size?: "sm" | "lg" }) {
  const pct = Math.round(rate * 100);
  const barH = size === "sm" ? "h-1.5" : "h-2.5";
  const textCls = size === "sm" ? "text-base font-bold" : "text-2xl font-bold";
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className={`${textCls} text-zinc-100`}>{pct}%</span>
        <span className="text-xs text-zinc-400">hoàn thành</span>
      </div>
      <div className={`w-full rounded-full bg-zinc-700 ${barH}`}>
        <div className={`${barH} rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// B3/E2: BREAK item — no status badge; STUDY/HABIT show Xong/Chưa
function SessionItem({ item }: { item: ReportItem }) {
  if (item.type === "BREAK") {
    return (
      <li className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-800/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">NGHỈ</span>
          <span className="text-sm text-zinc-500">{item.title}</span>
        </div>
        <span className="text-xs text-zinc-600">{item.minutes} phút</span>
      </li>
    );
  }
  const isDone = item.status === "done";
  const isHabit = item.type === "HABIT";
  return (
    <li className="flex items-center justify-between rounded-lg border border-zinc-700/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${isHabit ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}>
          {isHabit ? "HABIT" : "HỌC"}
        </span>
        <span className={`text-sm ${isDone ? "text-zinc-200" : "text-zinc-400"}`}>{item.title}</span>
      </div>
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}`}>
        {isDone ? "✓ Xong" : "Chưa xong"} · {item.minutes}p
      </span>
    </li>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [tab, setTab] = useState<"day" | "week" | "overview">("week");

  // Day report state
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [dayReport, setDayReport] = useState<DayReport | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayError, setDayError] = useState("");

  // Week report state
  const [selectedWeek, setSelectedWeek] = useState(currentWeekIso());
  const [weekReport, setWeekReport] = useState<WeekReport | null>(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [weekError, setWeekError] = useState("");

  // Local overview state
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [includePlanned, setIncludePlanned] = useState(false);

  useEffect(() => {
    (async () => {
      const [planRecord, taskList] = await Promise.all([
        getLatestPlan(),
        listTasks(),
      ]);
      setPlan(planRecord);
      setTasks(taskList);
    })().catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== "day") return;
    setDayLoading(true);
    setDayError("");
    getReportDay(selectedDate)
      .then(setDayReport)
      .catch((e: Error) => setDayError(e?.message || "Lỗi tải báo cáo ngày"))
      .finally(() => setDayLoading(false));
  }, [tab, selectedDate]);

  useEffect(() => {
    if (tab !== "week") return;
    setWeekLoading(true);
    setWeekError("");
    getReportWeek(selectedWeek)
      .then(setWeekReport)
      .catch((e: Error) => setWeekError(e?.message || "Lỗi tải báo cáo tuần"))
      .finally(() => setWeekLoading(false));
  }, [tab, selectedWeek]);

  const pageTitle = tab === "day" ? "Báo cáo ngày" : tab === "week" ? "Báo cáo tuần" : "Thống kê tổng quan";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        <p className="text-sm text-zinc-400">
          {tab === "day" && "Phiên học trong ngày — STUDY + HABIT tính tiến độ, BREAK hiển thị riêng."}
          {tab === "week" && "Tổng hợp tuần — STUDY + HABIT tính tiến độ, BREAK tách riêng."}
          {tab === "overview" && "Thống kê theo môn từ kế hoạch hiện tại (dữ liệu cục bộ)."}
        </p>
      </header>

      {/* E1: Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-0">
        {[
          { key: "week", label: "Tuần" },
          { key: "day", label: "Ngày" },
          { key: "overview", label: "Tổng quan" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? "border-emerald-500 text-emerald-300"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Ngày tab ─── */}
      {tab === "day" && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-zinc-400">Ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
            <button onClick={() => setSelectedDate(todayIso())} className="text-xs text-emerald-400 hover:underline">
              Hôm nay
            </button>
          </div>

          {dayLoading && <p className="text-sm text-zinc-400">Đang tải…</p>}
          {dayError && <p className="text-sm text-red-400">{dayError}</p>}

          {dayReport && !dayLoading && (
            <>
              <div className="card grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-zinc-400">Phút học (STUDY + HABIT)</p>
                  <p className="text-3xl font-bold text-zinc-100">{dayReport.total_minutes_done}</p>
                  <p className="text-xs text-zinc-500">/ {dayReport.total_minutes_planned} phút kế hoạch</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-2">% Hoàn thành</p>
                  <CompletionBar rate={dayReport.completion_rate} />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Nghỉ (BREAK)</p>
                  <p className="text-3xl font-bold text-zinc-500">{dayReport.break_minutes_planned}</p>
                  <p className="text-xs text-zinc-500">phút nghỉ (không tính %)</p>
                </div>
              </div>
              <div className="card grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">📚 Nhiệm vụ (STUDY)</p>
                  <p className="font-semibold text-zinc-200">{dayReport.study_minutes_done} / {dayReport.study_minutes_planned} phút</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">🌱 Thói quen (HABIT)</p>
                  <p className="font-semibold text-zinc-200">{dayReport.habit_minutes_done} / {dayReport.habit_minutes_planned} phút</p>
                </div>
              </div>
              <div className="card space-y-2">
                <h2 className="font-semibold flex justify-between">
                  <span>Phiên trong ngày {selectedDate}</span>
                  <span className="text-xs text-zinc-500">{dayReport.items.length} phiên</span>
                </h2>
                {/* E3: empty state */}
                {dayReport.items.length === 0 ? (
                  <p className="text-sm text-zinc-400">Chưa có phiên học trong ngày này.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {dayReport.items.map((item, i) => <SessionItem key={i} item={item} />)}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* ─── Tuần tab ─── */}
      {tab === "week" && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-zinc-400">Tuần:</label>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
            <button onClick={() => setSelectedWeek(currentWeekIso())} className="text-xs text-emerald-400 hover:underline">
              Tuần này
            </button>
          </div>

          {weekLoading && <p className="text-sm text-zinc-400">Đang tải…</p>}
          {weekError && <p className="text-sm text-red-400">{weekError}</p>}

          {weekReport && !weekLoading && (
            <>
              <div className="card grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-zinc-400">Phút học cả tuần</p>
                  <p className="text-3xl font-bold text-zinc-100">{weekReport.total_minutes_done}</p>
                  <p className="text-xs text-zinc-500">/ {weekReport.total_minutes_planned} phút kế hoạch</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-2">% Hoàn thành</p>
                  <CompletionBar rate={weekReport.completion_rate} />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Tổng nghỉ</p>
                  <p className="text-3xl font-bold text-zinc-500">{weekReport.break_minutes_planned}</p>
                  <p className="text-xs text-zinc-500">phút BREAK</p>
                </div>
              </div>
              <div className="card space-y-2">
                <h2 className="font-semibold">Từng ngày ({weekReport.start_date} → {weekReport.end_date})</h2>
                {Object.entries(weekReport.daily).map(([d, dr]) => {
                  const dayName = new Date(d + "T12:00:00").toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
                  const hasData = dr.total_minutes_planned > 0;
                  return (
                    <div key={d} className={`rounded-lg border px-3 py-2 ${d === todayIso() ? "border-emerald-500/40 bg-emerald-500/5" : "border-zinc-700/60"}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-sm text-zinc-300">{dayName}</span>
                        {hasData ? (
                          <>
                            <div className="flex-1 min-w-0">
                              <CompletionBar rate={dr.completion_rate} size="sm" />
                            </div>
                            <span className="shrink-0 text-xs text-zinc-400">
                              {dr.total_minutes_done}/{dr.total_minutes_planned}p
                              {dr.break_minutes_planned > 0 && <span className="text-zinc-600"> +{dr.break_minutes_planned}nghỉ</span>}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-600">Không có phiên</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* ─── Tổng quan tab (local) ─── */}
      {tab === "overview" && (
        <section className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                className="rounded border border-zinc-600 bg-transparent"
                checked={includePlanned}
                onChange={(e) => setIncludePlanned(e.target.checked)}
              />
              Bao gồm phiên chưa tick
            </label>
          </div>
          <section className="card space-y-3">
            <h2 className="font-semibold">Phân bổ theo môn</h2>
            {!plan ? (
              <p className="text-sm text-zinc-400">Chưa có kế hoạch.</p>
            ) : (() => {
              const sessions = plan.sessions.filter(
                (s) => s.source !== "break" && (includePlanned || (s.status === "done" && s.completedAt)),
              );
              const bySubject: Record<string, number> = {};
              for (const s of sessions) bySubject[s.subject] = (bySubject[s.subject] ?? 0) + s.minutes;
              const total = Object.values(bySubject).reduce((a, b) => a + b, 0);
              return Object.keys(bySubject).length === 0 ? (
                <p className="text-sm text-zinc-400">Chưa có dữ liệu{includePlanned ? "" : " hoàn thành"}.</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(bySubject).sort(([, a], [, b]) => b - a).map(([subject, minutes]) => (
                    <li key={subject} className="flex items-center justify-between text-sm">
                      <span>{subject}</span>
                      <span>{minutes} phút {total > 0 ? `(${Math.round(minutes / total * 100)}%)` : ""}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </section>
          <section className="card space-y-2">
            <h2 className="font-semibold">Tiến độ từng task</h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-zinc-400">Chưa có task.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => {
                  const scheduled = plan?.sessions
                    .filter((s) => s.taskId === task.id && s.source !== "break")
                    .reduce((sum, s) => sum + s.minutes, 0) ?? 0;
                  const target = task.targetMinutes || task.estimatedMinutes;
                  return (
                    <li key={task.id} className="rounded-lg border border-zinc-700/60 p-3 space-y-1">
                      <div className="flex justify-between">
                        <a href={`/tasks/${task.id}`} className="font-semibold text-sm hover:text-emerald-400">{task.title}</a>
                        <span className="text-xs text-zinc-500">
                          {task.durationMode === "exact" && task.durationMinutesExact
                            ? `Chính xác: ${task.durationMinutesExact}p`
                            : task.durationMinutesMin && task.durationMinutesMax
                            ? `${task.durationMinutesMin}–${task.durationMinutesMax}p`
                            : `~${task.estimatedMinutes}p`}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Đã lên lịch {scheduled}/{target} phút · Deadline {new Date(task.deadline).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </section>
      )}
    </div>
  );
}
