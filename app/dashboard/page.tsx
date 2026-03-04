"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { listTasks } from "@/src/lib/storage/tasksRepo";
import { listSlots } from "@/src/lib/storage/slotsRepo";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Task, Session } from "@/src/lib/types";
import { Tooltip } from "@/src/components/Tooltip";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";
import { getUser } from "@/src/lib/auth";
import {
  studentExchangeSummary,
  studentProgressSummary,
  studentBanners,
  studentBadgeSummary,
  ExchangeSummary,
  ProgressSummary,
  BannerItem,
  ExchangeBadgeSummary,
} from "@/src/lib/api/exchange";

// ── Banner component ───────────────────────────────────────────────────────

function DashboardBanners({ banners }: { banners: BannerItem[] }) {
  if (banners.length === 0) return null;
  const colorMap: Record<string, string> = {
    error: "border-red-500/40 bg-red-950/20 text-red-300",
    warning: "border-yellow-500/40 bg-yellow-950/20 text-yellow-300",
    info: "border-blue-500/40 bg-blue-950/20 text-blue-300",
  };
  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <div
          key={b.key}
          className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium ${colorMap[b.level] ?? colorMap.info}`}
        >
          <span>{b.message}</span>
          {b.href && (
            <Link href={b.href} className="ml-4 shrink-0 underline hover:no-underline text-xs">
              Xem →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Progress cards (Today + Week) ──────────────────────────────────────────

function ProgressCards({ progress }: { progress: ProgressSummary | null }) {
  const pct = (done: number, total: number) =>
    total === 0 ? 0 : Math.round((done / total) * 100);
  const todayPct = progress ? pct(progress.today.done_sessions, progress.today.planned_sessions) : 0;
  const weekPct = progress ? pct(progress.week.done_sessions, progress.week.planned_sessions) : 0;
  return (
    <>
      <div className="card">
        <Tooltip content="Phiên học đã hoàn thành trong ngày hôm nay so với kế hoạch">
          <p className="text-sm text-zinc-400">Hôm nay</p>
        </Tooltip>
        <p className="text-3xl font-bold text-emerald-400">{todayPct}%</p>
        <p className="text-xs text-zinc-500 mt-1">
          {progress?.today.done_sessions ?? 0}/{progress?.today.planned_sessions ?? 0} phiên
          {" · "}
          {progress?.today.done_minutes ?? 0}/{progress?.today.planned_minutes ?? 0} phút
        </p>
      </div>
      <div className="card">
        <Tooltip content="Phiên học hoàn thành trong tuần này (Thứ 2 – hôm nay)">
          <p className="text-sm text-zinc-400">Tuần này</p>
        </Tooltip>
        <p className="text-3xl font-bold text-sky-400">{weekPct}%</p>
        <p className="text-xs text-zinc-500 mt-1">
          {progress?.week.done_sessions ?? 0}/{progress?.week.planned_sessions ?? 0} phiên
          {" · "}
          {progress?.week.done_minutes ?? 0}/{progress?.week.planned_minutes ?? 0} phút
        </p>
      </div>
    </>
  );
}

// ── Exchange summary block ─────────────────────────────────────────────────

function ExchangeBlock({ summary, badge }: { summary: ExchangeSummary | null; badge: ExchangeBadgeSummary | null }) {
  if (!summary) {
    return (
      <section className="card border-zinc-700/40">
        <p className="text-sm text-zinc-500 animate-pulse">Đang tải Trao đổi…</p>
      </section>
    );
  }
  const { unread_parent_messages: unread, open_parent_tasks: openTasks, today_parent_habits: habits } = summary;
  const pendingHabits = Math.max(0, habits.total - habits.done);
  // P0: use badge-summary API total instead of local calculation
  const totalBadge = badge?.total_badge ?? (unread + openTasks + pendingHabits);
  const allEmpty = totalBadge === 0;

  return (
    <section className="card border-indigo-500/30 bg-indigo-950/10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          💬 Trao đổi với phụ huynh
          {totalBadge > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{totalBadge}</span>
          )}
        </h2>
        <Link href="/exchange" className="text-xs text-indigo-400 hover:text-indigo-300">Mở hộp thư →</Link>
      </div>

      {allEmpty ? (
        <p className="text-sm text-zinc-500">
          Chưa có trao đổi nào. Khi phụ huynh gửi nhắc nhở / giao nhiệm vụ, bạn sẽ thấy ở đây.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Link href="/exchange" className="flex items-center gap-2 rounded-lg border border-zinc-700 p-3 hover:border-indigo-500/40 transition-colors">
            <span className="text-xl">📬</span>
            <div>
              <p className="font-medium">{unread > 0 ? <span className="text-red-400">{unread} tin chưa đọc</span> : <span className="text-zinc-400">0 tin chưa đọc</span>}</p>
              <p className="text-zinc-500 text-xs">Tin nhắn từ phụ huynh</p>
            </div>
          </Link>
          <Link href="/exchange/assigned-tasks" className="flex items-center gap-2 rounded-lg border border-zinc-700 p-3 hover:border-indigo-500/40 transition-colors">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium">{openTasks > 0 ? <span className="text-amber-400">{openTasks} nhiệm vụ đang mở</span> : <span className="text-zinc-400">0 nhiệm vụ</span>}</p>
              <p className="text-zinc-500 text-xs">Nhiệm vụ được giao</p>
            </div>
          </Link>
          <Link href="/exchange/assigned-habits" className="flex items-center gap-2 rounded-lg border border-zinc-700 p-3 hover:border-indigo-500/40 transition-colors">
            <span className="text-xl">🌱</span>
            <div>
              <p className="font-medium">
                {habits.total === 0 ? (
                  <span className="text-zinc-400">Không có</span>
                ) : habits.done < habits.total ? (
                  <span className="text-yellow-400">{habits.done}/{habits.total} đã tick</span>
                ) : (
                  <span className="text-emerald-400">{habits.done}/{habits.total} ✅ Xong!</span>
                )}
              </p>
              <p className="text-zinc-500 text-xs">Thói quen hôm nay</p>
            </div>
          </Link>
        </div>
      )}

      <div className="mt-3 flex gap-2 flex-wrap">
        <Link href="/exchange" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">Mở Hộp thư</Link>
        <Link href="/exchange/assigned-tasks" className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Xem Nhiệm vụ được giao</Link>
        {habits.undone_ids.length > 0 && (
          <Link href="/exchange/assigned-habits" className="rounded-lg bg-yellow-600/80 px-3 py-1.5 text-xs font-semibold text-black hover:bg-yellow-500 transition-colors">
            Tick thói quen ({habits.undone_ids.length} còn lại)
          </Link>
        )}
      </div>
    </section>
  );
}

// ── Locked task priority alert ─────────────────────────────────────────────

function LockedTaskAlert({ plan }: { plan: any }) {
  if (!plan?.sessions) return null;
  const lockedCount = (plan.sessions as any[]).filter(
    (s: any) => s.lockedByParent || s.locked_by_parent || s.sourceType === "parent_task"
  ).length;
  const missingAlerts = ((plan.suggestions ?? []) as any[]).filter(
    (s: any) => typeof s.message === "string" && s.message.startsWith("LOCKED|")
  );
  if (lockedCount === 0 && missingAlerts.length === 0) return null;

  return (
    <section className="card border-red-500/30 bg-red-950/10">
      <h2 className="text-base font-semibold text-red-300 mb-2">🔒 Ưu tiên từ phụ huynh</h2>
      {lockedCount > 0 && (
        <p className="text-sm text-zinc-300 mb-1">{lockedCount} phiên học bắt buộc từ phụ huynh đã được xếp lịch.</p>
      )}
      {missingAlerts.map((s: any, i: number) => {
        const parts = s.message.split("|");
        return <p key={i} className="text-sm text-red-300 mb-1">⚠️ {parts[2] ?? s.message}</p>;
      })}
      <Link href="/exchange/assigned-tasks" className="mt-2 inline-block text-xs text-red-400 hover:text-red-300 underline">Xem nhiệm vụ →</Link>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [slotsCount, setSlotsCount] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [exchangeSummary, setExchangeSummary] = useState<ExchangeSummary | null>(null);
  const [badgeSummary, setBadgeSummary] = useState<ExchangeBadgeSummary | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const user = getUser();
    const student = user?.role === "student";
    setIsStudent(student);
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([listTasks(), listSlots(), getLatestPlan()])
      .then(([taskList, slotList, planData]) => {
        setTasks(taskList);
        setSlotsCount(slotList.length);
        setPlan(planData);
        if (planData?.sessions) {
          setUpcomingSessions(
            (planData.sessions as Session[]).filter((s) => new Date(s.plannedStart) > new Date()).slice(0, 4)
          );
        }
      })
      .catch(() => {});

    if (student) {
      studentExchangeSummary(today).then(setExchangeSummary).catch(() => {});
      studentBadgeSummary(today).then(setBadgeSummary).catch(() => {});
      studentProgressSummary().then(setProgress).catch(() => {});
      studentBanners(today).then(setBanners).catch(() => {});
    }
  }, []);

  const getNextStep = () => {
    if (tasks.length === 0) return { title: "Thêm nhiệm vụ đầu tiên", description: "Bắt đầu bằng cách tạo nhiệm vụ học tập với deadline", href: "/tasks", icon: "📝" };
    if (slotsCount === 0) return { title: "Nhập thời gian rảnh", description: "Cho hệ thống biết bạn có những khung giờ nào để học", href: "/free-time", icon: "⏰" };
    if (!plan) return { title: "Tạo kế hoạch", description: "Hệ thống sẽ tự động xếp lịch các phiên học cho bạn", href: "/plan", icon: "📅" };
    return { title: "Xem phiên học hôm nay", description: "Kiểm tra các phiên học đã được xếp cho hôm nay", href: "/today", icon: "🎯" };
  };

  const nextStep = getNextStep();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title="StudyFlow Dashboard"
        description="Nắm nhanh nhiệm vụ, slot rảnh và phiên học sắp tới."
        actions={
          <Link href="/tasks" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
            + Nhiệm vụ mới
          </Link>
        }
      />

      {/* Banners */}
      {isStudent && <DashboardBanners banners={banners} />}

      {/* Next step suggestion */}
      <section className="card border-emerald-500/40 bg-emerald-500/5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{nextStep.icon}</span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Hôm nay nên làm gì?</h2>
            <p className="text-sm text-zinc-400 mb-3">{nextStep.description}</p>
            <Link href={nextStep.href} className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">
              {nextStep.title} →
            </Link>
          </div>
        </div>
      </section>

      {/* Exchange summary block (students only) */}
      {isStudent && <ExchangeBlock summary={exchangeSummary} badge={badgeSummary} />}

      {/* Locked task alert (students only) */}
      {isStudent && <LockedTaskAlert plan={plan} />}

      {/* Stats row */}
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
        {isStudent ? (
          <ProgressCards progress={progress} />
        ) : (
          <div className="card">
            <p className="text-sm text-zinc-400">Completion rate</p>
            <p className="text-3xl font-bold text-white">—</p>
          </div>
        )}
      </section>

      {/* Upcoming sessions */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Phiên học sắp tới</h2>
        {upcomingSessions.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Chưa có phiên học nào"
            description="Tạo kế hoạch để hệ thống tự động xếp lịch các phiên học."
            primaryCTA={{ label: "Tạo kế hoạch", href: "/plan" }}
            secondaryCTA={{ label: "Thêm nhiệm vụ", href: "/tasks" }}
          />
        ) : (
          <ul className="space-y-3">
            {upcomingSessions.map((session: any) => (
              <li key={session.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3">
                <div className="flex items-center gap-2">
                  {(session.lockedByParent || session.locked_by_parent || session.sourceType === "parent_task") && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      {session.badgeLabel ?? session.badge_label ?? "Phụ huynh giao 🔒"}
                    </span>
                  )}
                  <div>
                    <p className="text-sm text-zinc-300">{session.subject}</p>
                    <p className="font-semibold">{session.title}</p>
                  </div>
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

