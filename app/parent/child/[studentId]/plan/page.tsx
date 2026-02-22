"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parentGetChildPlan } from "@/src/lib/api/parent";
import { Session } from "@/src/lib/types";

interface ChildPlan {
  id: string;
  createdAt?: string;
  sessions: Session[];
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ học", className: "text-zinc-400" },
  done: { label: "Hoàn thành", className: "text-emerald-400" },
  skipped: { label: "Bỏ qua", className: "text-amber-400" },
};

export default function ChildPlanPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [plan, setPlan] = useState<ChildPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    parentGetChildPlan(studentId)
      .then((data) => setPlan(data as ChildPlan))
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải kế hoạch"))
      .finally(() => setLoading(false));
  }, [studentId]);

  const sessions = plan?.sessions ?? [];
  const doneSessions = sessions.filter((s) => s.status === "done");
  const completionRate = sessions.length > 0
    ? Math.round((doneSessions.length / sessions.length) * 100)
    : 0;

  // Group sessions by date
  const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const date = s.plannedStart.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/parent" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Tổng quan
        </Link>
        <span className="text-zinc-600">/</span>
        <h1 className="text-xl font-bold">Kế hoạch của học sinh</h1>
      </div>

      <p className="text-xs text-zinc-500">Student ID: {studentId}</p>

      {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && !plan && (
        <p className="text-sm text-zinc-400">Học sinh chưa có kế hoạch nào.</p>
      )}

      {plan && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{sessions.length}</p>
              <p className="text-xs text-zinc-400 mt-1">Tổng buổi học</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{doneSessions.length}</p>
              <p className="text-xs text-zinc-400 mt-1">Đã hoàn thành</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{completionRate}%</p>
              <p className="text-xs text-zinc-400 mt-1">Tỉ lệ hoàn thành</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>Tiến độ tổng</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Sessions by date */}
          {sortedDates.length === 0 ? (
            <p className="text-sm text-zinc-400">Kế hoạch không có buổi học nào.</p>
          ) : (
            <div className="space-y-4">
              {sortedDates.map((date) => (
                <div key={date}>
                  <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                    {new Date(date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="space-y-2">
                    {byDate[date].map((s) => {
                      const st = STATUS_LABEL[s.status] ?? { label: s.status, className: "text-zinc-400" };
                      const start = new Date(s.plannedStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                      const end = new Date(s.plannedEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{s.title}</p>
                            <p className="text-xs text-zinc-500">
                              {start} – {end} · {s.minutes} phút · {s.subject}
                            </p>
                          </div>
                          <span className={`text-xs font-medium ${st.className}`}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
