"use client";

import { useEffect, useState } from "react";
import {
  parentGetLinkedStudents,
  parentGetWeeklySummary,
  parentGetStudentStats,
  LinkedStudentInfo,
  WeeklySummary,
  StudentStats,
} from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getRelativeWeeks(count = 8): { label: string; value: string }[] {
  const weeks = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const val = getWeekString(d);
    weeks.push({ value: val, label: i === 0 ? `Tuần này (${val})` : val });
  }
  return weeks;
}

export default function ParentReportsPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [weekStr, setWeekStr] = useState(getWeekString(new Date()));
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    parentGetLinkedStudents()
      .then((list) => {
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].student_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setErr("");
    setLoading(true);
    Promise.all([
      parentGetWeeklySummary(selectedId, weekStr),
      parentGetStudentStats(selectedId, "week"),
    ])
      .then(([s, st]) => {
        setSummary(s);
        setStats(st);
      })
      .catch(() => setErr("Không thể tải báo cáo"))
      .finally(() => setLoading(false));
  }, [selectedId, weekStr]);

  const selectedStudent = students.find((s) => s.student_id === selectedId);

  const summaryText = summary
    ? [
        `📊 Báo cáo học tập tuần ${weekStr}`,
        `Học sinh: ${selectedStudent?.full_name || selectedStudent?.username || ""}`,
        ``,
        `• Tiến độ: ${summary.completion_rate}% (${summary.done_sessions}/${summary.total_sessions} phiên)`,
        `• Tổng phút học: ${summary.total_minutes} phút`,
        `• Slot rảnh: ${summary.free_slot_minutes} phút | Cần: ${summary.planned_minutes} phút`,
        summary.upcoming_deadlines.length > 0
          ? `• Deadline sắp tới: ${summary.upcoming_deadlines
              .slice(0, 3)
              .map((d) => `${d.title} (T-${d.days_left}d)`)
              .join(", ")}`
          : "• Không có deadline sắp tới",
        summary.alerts.length > 0 ? `• Cảnh báo: ${summary.alerts.join("; ")}` : "• Không có cảnh báo",
        ``,
        `Tạo bởi StudyFlow`,
      ].join("\n")
    : "";

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => window.print();

  const workloadPct =
    summary && summary.free_slot_minutes > 0
      ? Math.min(100, Math.round((summary.planned_minutes / summary.free_slot_minutes) * 100))
      : 0;

  const weekOptions = getRelativeWeeks(8);

  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-4 print:max-w-full print:px-8">
      <PageHeader
        title="Báo cáo tuần"
        description="Xem tổng kết tiến độ và xuất báo cáo học tập của con."
        actions={
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleCopySummary}
              disabled={!summary}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              {copied ? "✓ Đã sao chép" : "Sao chép tóm tắt"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!summary}
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40"
            >
              🖨️ In / Xuất PDF
            </button>
          </div>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa liên kết với học sinh nào"
          description="Thêm con em trước khi xem báo cáo."
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Selectors */}
          <div className="flex flex-wrap items-center gap-4 print:hidden">
            {students.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="reportStudent" className="text-sm text-zinc-400">Học sinh:</label>
                <select
                  id="reportStudent"
                  name="reportStudent"
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
            <div className="flex items-center gap-2">
              <label htmlFor="weekSelect" className="text-sm text-zinc-400">Tuần:</label>
              <select
                id="weekSelect"
                name="weekSelect"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
                value={weekStr}
                onChange={(e) => setWeekStr(e.target.value)}
              >
                {weekOptions.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}
          {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}

          {!loading && summary && (
            <div className="space-y-6">
              {/* Print header */}
              <div className="hidden print:block text-center mb-4">
                <h1 className="text-xl font-bold text-black">Báo cáo học tập tuần {weekStr}</h1>
                <p className="text-gray-600">
                  Học sinh: {selectedStudent?.full_name || selectedStudent?.username}
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="card text-center">
                  <p className="text-xs text-zinc-400 mb-1">Tổng phút học</p>
                  <p className="text-3xl font-bold text-emerald-400">{summary.total_minutes}</p>
                  <p className="text-xs text-zinc-500">phút</p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-zinc-400 mb-1">Tỷ lệ hoàn thành</p>
                  <p className="text-3xl font-bold text-emerald-400">{summary.completion_rate}%</p>
                  <p className="text-xs text-zinc-500">
                    {summary.done_sessions}/{summary.total_sessions} phiên
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-zinc-400 mb-1">Môn học nhiều nhất</p>
                  <p className="text-2xl font-bold text-zinc-100">{stats?.top_subject || "—"}</p>
                </div>
              </div>

              {/* Workload meter */}
              <div className="card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-300">⚖️ Tải học tập</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      workloadPct > 90
                        ? "bg-red-500/20 text-red-300"
                        : workloadPct > 70
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {workloadPct > 90
                      ? "Quá tải"
                      : workloadPct > 70
                      ? "Hơi căng"
                      : "Cân bằng"}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Cần học: {summary.planned_minutes} phút</span>
                    <span>Slot rảnh: {summary.free_slot_minutes} phút</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-zinc-800">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        workloadPct > 90
                          ? "bg-red-500"
                          : workloadPct > 70
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, workloadPct)}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{workloadPct}% slot rảnh đã dùng</p>
                </div>
              </div>

              {/* Deadlines */}
              {summary.upcoming_deadlines.length > 0 && (
                <div className="card space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-300">⏰ Deadline sắp tới</h3>
                  <ul className="divide-y divide-zinc-800">
                    {summary.upcoming_deadlines.map((d) => (
                      <li key={d.task_id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{d.title}</p>
                          <p className="text-xs text-zinc-500">{d.subject}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            d.days_left <= 1
                              ? "bg-red-500/20 text-red-300"
                              : d.days_left <= 3
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {d.days_left === 0 ? "Hôm nay" : `Còn ${d.days_left} ngày`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alerts */}
              {summary.alerts.length > 0 && (
                <div className="card space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-300">⚠️ Cảnh báo</h3>
                  <ul className="space-y-1">
                    {summary.alerts.map((a, i) => (
                      <li key={i} className="text-sm text-yellow-300 flex items-start gap-2">
                        <span className="mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.alerts.length === 0 && (
                <p className="text-sm text-emerald-400">✓ Không có cảnh báo nào tuần này.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
