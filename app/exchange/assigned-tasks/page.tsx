"use client";

import { useEffect, useState } from "react";
import {
  studentListAssignedTasks,
  studentAcceptTask,
  studentMarkTaskDone,
  studentListTaskItems,
  studentUpdateTaskItem,
  studentQuickTaskUpdate,
  AssignedTask,
  TaskItem,
} from "@/src/lib/api/assigned";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  ASSIGNED: { label: "Đã giao", color: "bg-blue-500/20 text-blue-300" },
  SEEN: { label: "Đã xem", color: "bg-zinc-700 text-zinc-400" },
  ACCEPTED: { label: "Đã nhận", color: "bg-emerald-500/20 text-emerald-300" },
  INPROGRESS: { label: "Đang làm", color: "bg-yellow-500/20 text-yellow-300" },
  DONE: { label: "Hoàn thành", color: "bg-green-500/20 text-green-300" },
  VERIFIED: { label: "Đã xác nhận", color: "bg-purple-500/20 text-purple-300" },
  ARCHIVED: { label: "Đã lưu trữ", color: "bg-zinc-700 text-zinc-500" },
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "🟢 Thấp",
  2: "🟡 Vừa",
  3: "🔴 Cao",
};

function ChecklistSection({
  taskId,
  disabled,
}: {
  taskId: string;
  disabled: boolean;
}) {
  const [items, setItems] = useState<TaskItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const [sendingNote, setSendingNote] = useState(false);

  const load = async () => {
    if (loading || items !== null) return;
    setLoading(true);
    try {
      const data = await studentListTaskItems(taskId);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const handleTick = async (item: TaskItem) => {
    if (item.is_done || disabled) return;
    try {
      const updated = await studentUpdateTaskItem(taskId, item.id, { is_done: true });
      setItems((prev) => prev?.map((i) => (i.id === item.id ? updated : i)) ?? null);
    } catch {/* silent */}
  };

  const handleSendNote = async () => {
    if (!quickNote.trim()) return;
    setSendingNote(true);
    try {
      await studentQuickTaskUpdate(taskId, "note", quickNote.trim());
      setQuickNote("");
    } catch {/* silent */}
    finally {
      setSendingNote(false);
    }
  };

  const doneCount = (items ?? []).filter((i) => i.is_done).length;
  const totalCount = (items ?? []).length;

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        {open ? "▼" : "▶"} Checklist {items !== null ? `(${doneCount}/${totalCount})` : ""}
      </button>

      {open && (
        <div className="rounded-lg bg-zinc-800/60 p-3 space-y-2">
          {loading && <p className="text-xs text-zinc-500">Đang tải…</p>}

          {items !== null && items.length === 0 && (
            <p className="text-xs text-zinc-500 italic">Chưa có bước nào.</p>
          )}

          {items !== null && totalCount > 0 && (
            <>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-zinc-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%` }}
                />
              </div>

              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <button
                      onClick={() => handleTick(item)}
                      disabled={item.is_done || disabled}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${
                        item.is_done
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-zinc-500 hover:border-emerald-400"
                      }`}
                    >
                      {item.is_done && (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-black font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${item.is_done ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                        {item.label}
                      </p>
                      {item.subject && (
                        <p className="text-[10px] text-zinc-500">{item.subject}</p>
                      )}
                      {item.is_done && item.done_at && (
                        <p className="text-[10px] text-emerald-500">
                          {new Date(item.done_at).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Quick update note */}
          <div className="flex gap-2 pt-1">
            <input
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Ghi chú nhanh cho phụ huynh…"
              className="flex-1 rounded bg-zinc-700 px-2 py-1 text-xs text-white placeholder-zinc-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendNote()}
            />
            <button
              onClick={handleSendNote}
              disabled={sendingNote || !quickNote.trim()}
              className="rounded bg-zinc-600 px-2 py-1 text-xs hover:bg-zinc-500 disabled:opacity-40"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentAssignedTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    studentListAssignedTasks()
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (taskId: string) => {
    setActionLoading(taskId + "-accept");
    try {
      const updated = await studentAcceptTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast("✅ Đã nhận nhiệm vụ!");
    } catch {
      showToast("Lỗi khi nhận nhiệm vụ.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDone = async (taskId: string) => {
    setActionLoading(taskId + "-done");
    try {
      const updated = await studentMarkTaskDone(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast("🎉 Đã đánh dấu hoàn thành!");
    } catch {
      showToast("Lỗi khi cập nhật.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="p-8 text-sm text-zinc-400">Đang tải…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <PageHeader
        title="Nhiệm vụ được giao"
        description="Nhiệm vụ ba/mẹ giao cho bạn. Bạn có thể nhận làm và đánh dấu hoàn thành."
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Chưa có nhiệm vụ được giao"
          description="Khi phụ huynh giao nhiệm vụ, chúng sẽ hiện ở đây."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const st = STATUS_INFO[task.status] ?? { label: task.status, color: "bg-zinc-700 text-zinc-400" };
            const isDone = task.status === "DONE" || task.status === "VERIFIED";

            return (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{task.title}</h3>
                      {task.locked ? (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          🔒 Bắt buộc
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                          💡 Đề xuất
                        </span>
                      )}
                    </div>
                    {task.subject && (
                      <p className="text-xs text-zinc-500">Môn: {task.subject}</p>
                    )}
                    {task.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                      <span>{PRIORITY_LABELS[task.priority] ?? `P${task.priority}`}</span>
                      {task.deadline && <span>Hạn: {task.deadline}</span>}
                      <span className={`rounded-full px-2 py-0.5 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                </div>

                {task.student_note && (
                  <p className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                    Ghi chú: {task.student_note}
                  </p>
                )}

                {/* P1 — checklist */}
                <ChecklistSection taskId={task.id} disabled={isDone} />

                {/* Actions */}
                {!isDone && (
                  <div className="flex gap-2 pt-1">
                    {(task.status === "ASSIGNED" || task.status === "SEEN") && (
                      <button
                        onClick={() => handleAccept(task.id)}
                        disabled={actionLoading === task.id + "-accept"}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-500 disabled:opacity-50"
                      >
                        Nhận làm
                      </button>
                    )}
                    {(task.status === "ACCEPTED" || task.status === "INPROGRESS") && (
                      <button
                        onClick={() => handleDone(task.id)}
                        disabled={actionLoading === task.id + "-done"}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-black hover:bg-green-500 disabled:opacity-50"
                      >
                        Đánh dấu xong
                      </button>
                    )}
                  </div>
                )}
                {isDone && (
                  <p className="text-xs text-green-400">✅ Đã hoàn thành</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
