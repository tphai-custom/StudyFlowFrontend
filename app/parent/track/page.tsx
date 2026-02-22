"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  parentGetLinkedStudents,
  parentGetWeeklySummary,
  parentGetChildTasks,
  parentGetChildPlan,
  parentGetStudentStats,
  LinkedStudentInfo,
  WeeklySummary,
  StudentStats,
} from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

type Tab = "overview" | "tasks" | "plan" | "stats";

const TASK_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "deadline", label: "Gần deadline" },
  { value: "important", label: "Quan trọng" },
  { value: "incomplete", label: "Chưa làm" },
];

export default function ParentTrackPage() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);

  // Tab data
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [statsRange, setStatsRange] = useState<"week" | "month">("week");
  const [taskFilter, setTaskFilter] = useState("");
  const [planRange, setPlanRange] = useState<"today" | "week">("today");
  const [err, setErr] = useState("");

  // Load student list
  useEffect(() => {
    parentGetLinkedStudents()
      .then((list) => {
        setStudents(list);
        const childParam = searchParams.get("child");
        if (childParam && list.find((s) => s.student_id === childParam)) {
          setSelectedId(childParam);
        } else if (list.length > 0) {
          setSelectedId(list[0].student_id);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data when student or tab changes
  useEffect(() => {
    if (!selectedId) return;
    setErr("");
    setLoading(true);

    const load = async () => {
      try {
        if (tab === "overview") {
          const s = await parentGetWeeklySummary(selectedId);
          setSummary(s);
        } else if (tab === "tasks") {
          const t = await parentGetChildTasks(selectedId, taskFilter || undefined);
          setTasks(t as any[]);
        } else if (tab === "plan") {
          try {
            const p = await parentGetChildPlan(selectedId);
            setPlan(p);
          } catch {
            setPlan(null);
          }
        } else if (tab === "stats") {
          const s = await parentGetStudentStats(selectedId, statsRange);
          setStats(s);
        }
      } catch (e) {
        setErr("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedId, tab, taskFilter, statsRange]);

  const selectedStudent = students.find((s) => s.student_id === selectedId);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "tasks", label: "Nhiệm vụ" },
    { key: "plan", label: "Kế hoạch" },
    { key: "stats", label: "Thống kê" },
  ];

  // Filter plan sessions
  const planSessions = (() => {
    if (!plan?.sessions) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return (plan.sessions as any[]).filter((s: any) => {
      const ps = s.plannedStart || s.planned_start || "";
      if (!ps) return false;
      const dt = new Date(ps);
      if (planRange === "today") return ps.startsWith(todayStr);
      return dt >= now && dt <= weekEnd;
    });
  })();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title="Theo dõi con em"
        description="Xem nhiệm vụ, kế hoạch và tiến độ học tập của con."
        actions={
          <Link
            href="/parent/children"
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Quản lý liên kết
          </Link>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa liên kết với học sinh nào"
          description="Thêm con em bằng cách nhập tên đăng nhập và mã liên kết."
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Student selector */}
          {students.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Học sinh:</span>
              <select
                id="studentSelect"
                name="studentSelect"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.full_name || s.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}
          {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}

          {/* === TAB: OVERVIEW === */}
          {!loading && tab === "overview" && (
            <div className="space-y-4">
              {!summary ? (
                <EmptyState icon="📊" title="Chưa có dữ liệu" description="Học sinh chưa có kế hoạch." primaryCTA={{ label: "Xem kế hoạch", href: "/parent/track" }} />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Card 1: Tiến độ tuần */}
                    <div className="card space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-300">📈 Tiến độ tuần</h3>
                      <div>
                        <p className="text-3xl font-bold text-emerald-400">{summary.completion_rate}%</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {summary.done_sessions}/{summary.total_sessions} phiên · {summary.total_minutes} phút
                        </p>
                      </div>
                      {summary.total_sessions === 0 && (
                        <p className="text-xs text-zinc-500">Chưa có kế hoạch tuần này</p>
                      )}
                      <div className="h-1.5 w-full rounded-full bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${summary.completion_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Card 2: Deadline sắp tới */}
                    <div className="card space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-300">⏰ Deadline sắp tới</h3>
                      {summary.upcoming_deadlines.length === 0 ? (
                        <p className="text-xs text-zinc-500">Không có deadline trong 7 ngày tới</p>
                      ) : (
                        <ul className="space-y-2">
                          {summary.upcoming_deadlines.slice(0, 3).map((d) => (
                            <li key={d.task_id} className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-zinc-200">{d.title}</p>
                                <p className="text-xs text-zinc-500">{d.subject}</p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  d.days_left <= 1
                                    ? "bg-red-500/20 text-red-300"
                                    : d.days_left <= 3
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : "bg-zinc-700 text-zinc-400"
                                }`}
                              >
                                T-{d.days_left}d
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Card 3: Cảnh báo */}
                    <div className="card space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-300">⚠️ Cảnh báo</h3>
                      {summary.alerts.length === 0 ? (
                        <p className="text-xs text-emerald-400">✓ Không có cảnh báo nào</p>
                      ) : (
                        <ul className="space-y-2">
                          {summary.alerts.map((a, i) => (
                            <li key={i} className="text-xs text-yellow-300">{a}</li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-1">
                        <p className="text-xs text-zinc-500">
                          Slot rảnh: {summary.free_slot_minutes} phút · Cần: {summary.planned_minutes} phút
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setTab("tasks")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      Xem nhiệm vụ →
                    </button>
                    <Link
                      href="/parent/nudges"
                      className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Gợi ý nhắc nhở →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === TAB: TASKS === */}
          {!loading && tab === "tasks" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {TASK_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTaskFilter(f.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      taskFilter === f.value
                        ? "bg-emerald-500 text-black"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {tasks.length === 0 ? (
                <EmptyState icon="📚" title="Không có nhiệm vụ" description="Học sinh chưa có nhiệm vụ nào." />
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t: any) => {
                    const pct = t.estimated_minutes > 0
                      ? Math.min(100, Math.round(((t.progress_minutes ?? 0) / t.estimated_minutes) * 100))
                      : 0;
                    const isOverdue = new Date(t.deadline) < new Date() && pct < 100;
                    return (
                      <li key={t.id} className="card p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">{t.subject}</span>
                              {isOverdue && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">⚠️ Quá hạn</span>}
                              {pct >= 100 && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-300">✓ Xong</span>}
                            </div>
                            <p className="font-medium text-zinc-100 text-sm">{t.title}</p>
                            <p className="text-xs text-zinc-500">
                              Deadline: {new Date(t.deadline).toLocaleDateString("vi-VN")} · Độ khó: {t.difficulty}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-emerald-400">{pct}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-zinc-800">
                          <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* === TAB: PLAN === */}
          {!loading && tab === "plan" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["today", "week"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setPlanRange(r)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      planRange === r ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {r === "today" ? "Hôm nay" : "Tuần này"}
                  </button>
                ))}
              </div>
              {!plan ? (
                <EmptyState
                  icon="📅"
                  title="Chưa có kế hoạch"
                  description="Học sinh chưa tạo kế hoạch. Nhắc con tạo kế hoạch trong StudyFlow."
                  primaryCTA={{ label: "Gửi nhắc nhở", href: "/parent/nudges" }}
                />
              ) : planSessions.length === 0 ? (
                <p className="text-sm text-zinc-400">Không có phiên học nào trong khoảng thời gian này.</p>
              ) : (
                <ul className="space-y-2">
                  {planSessions.map((s: any) => (
                    <li key={s.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{s.title}</p>
                        <p className="text-xs text-zinc-500">
                          {s.subject} · {s.minutes} phút · {format(new Date(s.plannedStart || s.planned_start), "dd/MM HH:mm")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          s.status === "done"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : s.status === "skipped"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {s.status === "done" ? "✓ Xong" : s.status === "skipped" ? "Bỏ qua" : "Chờ"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* === TAB: STATS === */}
          {!loading && tab === "stats" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["week", "month"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setStatsRange(r)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      statsRange === r ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {r === "week" ? "Tuần này" : "Tháng này"}
                  </button>
                ))}
              </div>
              {!stats ? (
                <EmptyState icon="📊" title="Chưa có dữ liệu" description="Học sinh chưa có kế hoạch đã hoàn thành." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="card text-center">
                    <p className="text-xs text-zinc-400 mb-1">Tổng phút học</p>
                    <p className="text-3xl font-bold text-emerald-400">{stats.total_minutes}</p>
                    <p className="text-xs text-zinc-500">phút</p>
                  </div>
                  <div className="card text-center">
                    <p className="text-xs text-zinc-400 mb-1">Tỷ lệ hoàn thành</p>
                    <p className="text-3xl font-bold text-emerald-400">{stats.completion_rate}%</p>
                  </div>
                  <div className="card text-center">
                    <p className="text-xs text-zinc-400 mb-1">Môn học nhiều nhất</p>
                    <p className="text-2xl font-bold text-zinc-100">{stats.top_subject || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
