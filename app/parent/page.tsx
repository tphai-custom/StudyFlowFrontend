"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  parentGetLinkedStudents,
  parentGetWeeklySummary,
  LinkedStudentInfo,
  WeeklySummary,
} from "@/src/lib/api/parent";
import {
  parentGetAssignSettings,
  parentListAssignedTasks,
  parentListHabitsWithStatus,
} from "@/src/lib/api/assigned";
import { EmptyState } from "@/src/components/EmptyState";

type StudentSummaryEntry = {
  student: LinkedStudentInfo;
  summary: WeeklySummary | null;
  loading: boolean;
};

type OnboardingState = {
  linked: boolean;
  nudgesSet: boolean;
  taskAssigned: boolean;
};

function OnboardingChecklist({
  state,
  collapsed,
  onToggle,
}: {
  state: OnboardingState;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const steps = [
    {
      done: state.linked,
      icon: "🔗",
      label: "Liên kết con em",
      desc: "Nhập tên đăng nhập và mã liên kết của con.",
      href: "/parent/children",
      accentClass: "group-hover:text-emerald-300 hover:border-emerald-500/50",
    },
    {
      done: state.nudgesSet,
      icon: "🔔",
      label: "Chọn cách nhắc",
      desc: "Chọn giọng điệu và giờ nhắc phù hợp.",
      href: "/parent/nudges",
      accentClass: "group-hover:text-blue-300 hover:border-blue-500/50",
    },
    {
      done: state.taskAssigned,
      icon: "📋",
      label: "Giao nhiệm vụ đầu tiên",
      desc: "Tạo 1 nhiệm vụ hoặc thói quen cho con.",
      href: "/parent/assign",
      accentClass: "group-hover:text-purple-300 hover:border-purple-500/50",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">🚀 Bắt đầu nhanh</h2>
          <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {doneCount}/{steps.length}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {collapsed ? "Hiện ▾" : "Ẩn ▴"}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Mini progress bar */}
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((doneCount / steps.length) * 100)}%` }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className={`group relative rounded-xl border p-4 transition-colors ${
                  step.done
                    ? "border-emerald-700/40 bg-emerald-950/10 cursor-default pointer-events-none"
                    : `border-zinc-700 bg-zinc-800 ${step.accentClass}`
                }`}
              >
                {step.done && (
                  <span className="absolute right-3 top-3 text-emerald-400 text-sm">✓</span>
                )}
                <div className={`mb-2 text-2xl ${step.done ? "grayscale opacity-50" : ""}`}>
                  {step.icon}
                </div>
                <p
                  className={`text-sm font-medium ${
                    step.done ? "text-zinc-500 line-through" : "text-white"
                  }`}
                >
                  {step.label}
                </p>
                <p className={`mt-1 text-xs ${step.done ? "text-zinc-600" : "text-zinc-500"}`}>
                  {step.done ? "Đã hoàn thành" : step.desc}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ParentDashboardPage() {
  const [entries, setEntries] = useState<StudentSummaryEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    linked: false,
    nudgesSet: false,
    taskAssigned: false,
  });
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(false);

  useEffect(() => {
    parentGetLinkedStudents()
      .then(async (students) => {
        const initial: StudentSummaryEntry[] = students.map((s) => ({
          student: s,
          summary: null,
          loading: true,
        }));
        setEntries(initial);
        setPageLoading(false);

        const linked = students.length > 0;

        // Check onboarding steps in parallel
        const [settingsResult, tasksResult, habitsResult] = await Promise.allSettled([
          parentGetAssignSettings(),
          linked ? parentListAssignedTasks(students[0].student_id) : Promise.resolve([]),
          linked ? parentListHabitsWithStatus(students[0].student_id) : Promise.resolve([]),
        ]);

        const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
        const tasks = tasksResult.status === "fulfilled" ? tasksResult.value : [];
        const habits = habitsResult.status === "fulfilled" ? habitsResult.value : [];

        setOnboarding({
          linked,
          nudgesSet: !!(
            settings &&
            (settings.default_remind_time || settings.intervention_level !== "medium")
          ),
          taskAssigned: tasks.length > 0 || habits.length > 0,
        });

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

  const allOnboardingDone =
    onboarding.linked && onboarding.nudgesSet && onboarding.taskAssigned;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      {/* ── Hero ── */}
      <div className="rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bảng điều khiển phụ huynh</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Theo dõi tiến độ – gửi nhắc nhở – giao nhiệm vụ và thói quen cho con.
          </p>
        </div>

        {/* 3 chips */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            ✅ Theo dõi tuần &amp; cảnh báo
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
            💬 Nhắc &amp; Gợi ý (lưu nhật ký)
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            📌 Giao nhiệm vụ / thói quen
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/parent/children"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            + Quản lý liên kết
          </Link>
          <Link
            href="/parent/assign"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            + Giao nhiệm vụ
          </Link>
        </div>
      </div>

      {/* ── Onboarding checklist (hidden when all done or still loading) ── */}
      {!pageLoading && !allOnboardingDone && (
        <OnboardingChecklist
          state={onboarding}
          collapsed={onboardingCollapsed}
          onToggle={() => setOnboardingCollapsed((v) => !v)}
        />
      )}

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
              <div className="flex gap-2 pt-1 flex-wrap">
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
                  href={`/parent/assign?child=${student.student_id}`}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Giao nhiệm vụ
                </Link>
                <Link
                  href="/parent/assign/messages"
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Nhắn tin
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
