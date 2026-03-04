"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listTasks, saveTask } from "@/src/lib/storage/tasksRepo";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Task, Session } from "@/src/lib/types";
import { PageHeader } from "@/src/components/PageHeader";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Rất dễ", 2: "Dễ", 3: "Trung bình", 4: "Khó", 5: "Rất khó",
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [relatedSessions, setRelatedSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // listTasks() already enriches with plan progress data
    Promise.all([listTasks(), getLatestPlan()])
      .then(([tasks, plan]) => {
        const found = tasks.find((t) => t.id === id) ?? null;
        setTask(found);
        if (found) setNotes(found.notes ?? "");
        if (plan && found) {
          setRelatedSessions(plan.sessions.filter((s) => s.taskId === found.id));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveNotes = async () => {
    if (!task) return;
    setSaveStatus("Đang lưu…");
    await saveTask({ ...task, id: task.id, notes, durationMode: task.durationMode ?? "estimate", schedulingStyle: task.schedulingStyle ?? "balanced" });
    setSaveStatus("✓ Đã lưu");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  if (loading) return <div className="mx-auto max-w-[1200px] px-4 py-8 text-zinc-400">Đang tải…</div>;
  if (!task) return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <p className="text-zinc-400">Không tìm thấy nhiệm vụ.</p>
      <button className="mt-3 text-sm text-emerald-400 underline" onClick={() => router.back()}>← Quay lại</button>
    </div>
  );

  // Use enriched progress fields — these come from plan sessions (done_minutes / planned_minutes)
  const doneMinutes = task.doneMinutes ?? task.progressMinutes ?? 0;
  const plannedMinutes = task.plannedMinutes ?? task.estimatedMinutes ?? 1;
  const pct = task.progressPercent ?? Math.min(100, Math.round((doneMinutes / plannedMinutes) * 100));
  const doneSessions = task.sessionsDone ?? relatedSessions.filter((s) => s.status === "done").length;
  const totalSessions = task.totalSessions ?? relatedSessions.length;

  const isOverdue = new Date(task.deadline) < new Date() && pct < 100;
  const criteria = Array.isArray(task.successCriteria)
    ? task.successCriteria
    : task.successCriteria ? [task.successCriteria] : [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title={task.title}
        description={`${task.subject} · Độ khó: ${DIFFICULTY_LABEL[task.difficulty] ?? task.difficulty}`}
        breadcrumbs={[
          { label: "Nhiệm vụ", href: "/tasks" },
          { label: task.title },
        ]}
        actions={
          <button
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            onClick={() => router.back()}
          >
            ← Quay lại
          </button>
        }
      />

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {isOverdue && (
          <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">⚠️ Quá hạn</span>
        )}
        {pct >= 100 && (
          <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">✓ Hoàn thành</span>
        )}
        {task.lockedByParent && (
          <span className="rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">🔒 Bị khoá bởi phụ huynh</span>
        )}
      </div>

      {/* Overview grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1">Deadline</p>
          <p className={`text-sm font-semibold ${isOverdue ? "text-red-300" : "text-zinc-200"}`}>
            {new Date(task.deadline).toLocaleString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1">Thời lượng</p>
          <p className="text-sm font-semibold text-zinc-200">
            {task.durationMode === "exact" && task.durationMinutesExact
              ? `Chính xác: ${task.durationMinutesExact} phút`
              : task.durationMinutesMin && task.durationMinutesMax
              ? `Ước lượng: ${task.durationMinutesMin}–${task.durationMinutesMax} phút`
              : task.durationUnit === "hours"
              ? `${(task.durationEstimateMin / 60).toFixed(0)}–${(task.durationEstimateMax / 60).toFixed(0)} giờ`
              : `~${task.estimatedMinutes} phút`}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1">Tiến độ</p>
          <p className="text-sm font-semibold text-zinc-200">
            {doneMinutes} / {plannedMinutes} phút
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{pct}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1">Buổi học</p>
          <p className="text-sm font-semibold text-zinc-200">{doneSessions} / {totalSessions} xong</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Tiến độ tổng</span>
          <span className="font-medium text-zinc-200">{doneMinutes}/{plannedMinutes} phút · {pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-zinc-800">
          <div
            className="h-3 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Thông tin kế hoạch — E: always visible */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">🗂️ Thông tin kế hoạch</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {/* Scheduling style */}
          <div className="rounded-lg border border-zinc-700/60 px-3 py-2">
            <p className="text-[11px] text-zinc-500 mb-0.5">Phong cách chia lịch</p>
            <p className="text-sm font-medium text-zinc-200">
              {task.schedulingStyle === "front-load" && "⏩ Xong sớm"}
              {task.schedulingStyle === "deadline-loaded" && "⏰ Gần deadline"}
              {(!task.schedulingStyle || task.schedulingStyle === "balanced") && "⚖️ Rải đều (Balanced)"}
            </p>
          </div>
          {/* Duration info — AC1/AC3: show estimate vs exact clearly */}
          <div className="rounded-lg border border-zinc-700/60 px-3 py-2">
            <p className="text-[11px] text-zinc-500 mb-0.5">Thời lượng</p>
            {task.durationMode === "exact" && task.durationMinutesExact ? (
              <p className="text-sm font-medium text-zinc-200">Chính xác: {task.durationMinutesExact} phút</p>
            ) : task.durationMinutesMin && task.durationMinutesMax ? (
              <p className="text-sm font-medium text-zinc-200">Ước lượng: {task.durationMinutesMin}–{task.durationMinutesMax} phút</p>
            ) : (
              <p className="text-sm font-medium text-zinc-200">~{task.estimatedMinutes} phút</p>
            )}
          </div>
        </div>
        {/* AC3: Planner used target_minutes */}
        {task.targetMinutes != null && task.targetMinutes > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/60 px-3 py-2">
            <span className="shrink-0 mt-0.5">🎯</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Planner dùng: <strong>{task.targetMinutes} phút</strong>
                {task.durationMode === "estimate" && task.durationMinutesMax && task.targetMinutes > task.durationMinutesMax && (
                  <span className="ml-2 text-xs text-amber-400">(⚠️ Đã điều chỉnh về tối đa {task.durationMinutesMax} phút)</span>
                )}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Buffer và nghỉ không làm tăng phút học — tiến độ tính theo phút học thật.</p>
            </div>
          </div>
        )}
        {/* Parent badge */}
        {task.source === "parent" && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2">
            <span className="text-sm text-blue-300 font-medium">👨‍👩‍👧 Từ phụ huynh 🔒</span>
            {(task.locked || task.lockedByParent) && (
              <span className="text-xs text-amber-300">Bắt buộc hoàn thành</span>
            )}
          </div>
        )}
      </div>

      {/* Checklist — success criteria */}
      {criteria.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-200">Tiêu chí thành công</h2>
          <ul className="space-y-2">
            {criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 shrink-0 text-emerald-400">☑</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Milestones */}
      {task.milestones && task.milestones.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-200">Milestones</h2>
          <ul className="space-y-2">
            {task.milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 px-3 py-2">
                <span className="text-sm text-zinc-300">{m.title}</span>
                <span className="text-xs text-zinc-500">{m.minutesEstimate} phút</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Ghi chú</h2>
        <textarea
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none"
          rows={5}
          placeholder="Ghi chú, nhận xét, điểm cần ôn thêm…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{saveStatus}</span>
          <button
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            onClick={handleSaveNotes}
          >
            Lưu ghi chú
          </button>
        </div>
      </div>

      {/* Related plan sessions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Phiên học trong kế hoạch ({totalSessions})</h2>
        {totalSessions === 0 ? (
          <p className="text-sm text-zinc-500">
            Chưa có phiên nào được xếp.{" "}
            <a href="/plan" className="text-emerald-400 hover:underline">Tạo kế hoạch →</a>
          </p>
        ) : (
          <ul className="space-y-2">
            {relatedSessions.map((s) => {
              const start = new Date(s.plannedStart).toLocaleString("vi-VN", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
              });
              const statusMap: Record<string, { label: string; cls: string }> = {
                done: { label: "✓ Xong", cls: "text-emerald-400" },
                skipped: { label: "Bỏ qua", cls: "text-amber-400" },
                pending: { label: "Chờ học", cls: "text-zinc-400" },
              };
              const st = statusMap[s.status] ?? { label: s.status, cls: "text-zinc-400" };
              return (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{s.title}</p>
                    <p className="text-xs text-zinc-500">{start} · {s.minutes} phút</p>
                  </div>
                  <span className={`text-xs font-medium ${st.cls}`}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
