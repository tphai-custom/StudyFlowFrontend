"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  parentGetLinkedStudents,
  parentGetWeeklySummary,
  LinkedStudentInfo,
  WeeklySummary,
} from "@/src/lib/api/parent";
import { getUser, getFullName, AuthUser } from "@/src/lib/auth";
import { EmptyState } from "@/src/components/EmptyState";
import { PageHeader } from "@/src/components/PageHeader";

type StudentSummaryEntry = {
  student: LinkedStudentInfo;
  summary: WeeklySummary | null;
  loading: boolean;
};

export default function ParentDashboardPage() {
  const [entries, setEntries] = useState<StudentSummaryEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
    parentGetLinkedStudents()
      .then(async (students) => {
        const initial: StudentSummaryEntry[] = students.map((s) => ({
          student: s,
          summary: null,
          loading: true,
        }));
        setEntries(initial);
        setPageLoading(false);

        // Fetch each student's weekly summary
        await Promise.all(
          students.map(async (s, idx) => {
            try {
              const summary = await parentGetWeeklySummary(s.student_id);
              setEntries((prev) =>
                prev.map((e, i) => (i === idx ? { ...e, summary, loading: false } : e))
              );
            } catch {
              setEntries((prev) =>
                prev.map((e, i) => (i === idx ? { ...e, loading: false } : e))
              );
            }
          })
        );
      })
      .catch(() => setPageLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title={`Xin chào, ${user ? getFullName(user) : "Phụ huynh"} 👋`}
        description="Bảng điều khiển phụ huynh — theo dõi tiến độ học tập của con em."
        actions={
          <Link
            href="/parent/children"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            + Quản lý liên kết
          </Link>
        }
      />

      {pageLoading ? (
        <p className="text-sm text-zinc-400">Đang tải…</p>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa có học sinh nào được liên kết"
          description="Thêm con em bằng cách nhập tên đăng nhập và mã liên kết của học sinh."
          primaryCTA={{ label: "Thêm con em", href: "/parent/children" }}
        />
      ) : (
        <div className="space-y-6">
          {entries.map(({ student, summary, loading }) => (
            <div key={student.student_id} className="card space-y-4">
              {/* Student header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-100 text-base">{student.full_name}</p>
                  <p className="text-xs text-zinc-500">@{student.username}</p>
                </div>
                <Link
                  href={`/parent/track?child=${student.student_id}`}
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Xem đầy đủ →
                </Link>
              </div>

              {loading ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-zinc-800 animate-pulse" />
                  ))}
                </div>
              ) : !summary ? (
                <p className="text-sm text-zinc-500">Chưa có dữ liệu tuần này.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Card 1: Tiến độ tuần */}
                  <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4 space-y-2">
                    <p className="text-xs text-zinc-400">📈 Tiến độ tuần</p>
                    <p className="text-2xl font-bold text-emerald-400">{summary.completion_rate}%</p>
                    <div className="h-1 w-full rounded-full bg-zinc-800">
                      <div
                        className="h-1 rounded-full bg-emerald-500"
                        style={{ width: `${summary.completion_rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">{summary.done_sessions}/{summary.total_sessions} phiên · {summary.total_minutes} phút</p>
                  </div>

                  {/* Card 2: Deadline gần nhất */}
                  <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4 space-y-2">
                    <p className="text-xs text-zinc-400">⏰ Deadline sắp tới</p>
                    {summary.upcoming_deadlines.length === 0 ? (
                      <p className="text-xs text-zinc-500">Không có deadline trong 7 ngày</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {summary.upcoming_deadlines[0].title}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            summary.upcoming_deadlines[0].days_left <= 1
                              ? "bg-red-500/20 text-red-300"
                              : summary.upcoming_deadlines[0].days_left <= 3
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          Còn {summary.upcoming_deadlines[0].days_left} ngày
                        </span>
                        {summary.upcoming_deadlines.length > 1 && (
                          <p className="text-xs text-zinc-600">+{summary.upcoming_deadlines.length - 1} deadline khác</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Card 3: Cảnh báo */}
                  <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4 space-y-2">
                    <p className="text-xs text-zinc-400">⚠️ Cảnh báo</p>
                    {summary.alerts.length === 0 ? (
                      <p className="text-xs text-emerald-400">✓ Không có cảnh báo</p>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-yellow-400">{summary.alerts.length}</p>
                        <p className="text-xs text-zinc-500 line-clamp-2">{summary.alerts[0]}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/parent/track?child=${student.student_id}`}
                  className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-600/40"
                >
                  Theo dõi
                </Link>
                <Link
                  href="/parent/nudges"
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Nhắc nhở
                </Link>
                <Link
                  href="/parent/reports"
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Báo cáo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
