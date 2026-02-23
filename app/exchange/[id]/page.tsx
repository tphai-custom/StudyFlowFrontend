"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExchangeMessage,
  studentGetMessage,
  studentReply,
  studentPinMessage,
  actionCreateTask,
  actionCreateSession,
  actionPinToday,
} from "@/src/lib/api/exchange";
import { studentListAssignedTasks, AssignedTask } from "@/src/lib/api/assigned";
import { actionAddChecklistItem } from "@/src/lib/api/exchange";
import { PageHeader } from "@/src/components/PageHeader";

const TAG_LABELS: Record<string, string> = {
  motivation: "💪 Động lực",
  reminder: "🔔 Nhắc nhở",
  praise: "🌟 Khen ngợi",
  suggestion: "💡 Gợi ý",
  other: "💬 Khác",
};

const QUICK_REPLIES = [
  { value: "LIKE", label: "👍 Con hiểu rồi" },
  { value: "DO_TODAY", label: "✅ Con sẽ làm hôm nay" },
  { value: "RESCHEDULE", label: "🕒 Con xin dời sang mai" },
  { value: "NEED_HELP", label: "❓ Con cần giúp" },
];

export default function ExchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params?.id as string;

  const [msg, setMsg] = useState<ExchangeMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [checklistItem, setChecklistItem] = useState("");

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!messageId) return;
    studentGetMessage(messageId)
      .then((data) => {
        setMsg(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    studentListAssignedTasks().then(setTasks).catch(() => {});
  }, [messageId]);

  const handleQuickReply = async (value: string) => {
    if (!msg) return;
    setReplying(true);
    try {
      const updated = await studentReply(msg.id, value, replyText || undefined);
      setMsg(updated);
      showToast("Đã phản hồi thành công!");
    } catch {
      showToast("Lỗi khi phản hồi.");
    } finally {
      setReplying(false);
    }
  };

  const handlePin = async () => {
    if (!msg) return;
    try {
      const updated = await studentPinMessage(msg.id);
      setMsg(updated);
      showToast(updated.pinned ? "Đã ghim tin nhắn" : "Đã bỏ ghim");
    } catch {
      showToast("Lỗi khi ghim.");
    }
  };

  const handleCreateTask = async () => {
    if (!msg) return;
    setActionLoading("create-task");
    try {
      const result = await actionCreateTask(msg.id);
      showToast(`✅ Đã tạo nhiệm vụ: "${result.title}"`);
    } catch {
      showToast("Lỗi khi tạo nhiệm vụ.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddChecklist = async () => {
    if (!msg || !selectedTaskId || !checklistItem.trim()) return;
    setActionLoading("add-checklist");
    try {
      await actionAddChecklistItem(msg.id, selectedTaskId, checklistItem.trim());
      showToast("✅ Đã thêm vào checklist.");
      setChecklistItem("");
    } catch {
      showToast("Lỗi khi thêm checklist.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSession = async (minutes: 25 | 45) => {
    if (!msg) return;
    setActionLoading(`session-${minutes}`);
    try {
      const result = await actionCreateSession(msg.id, minutes);
      showToast(`✅ Đã tạo phiên học ${minutes} phút hôm nay!`);
    } catch {
      showToast("Lỗi khi tạo phiên học.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePinToday = async () => {
    if (!msg) return;
    setActionLoading("pin-today");
    try {
      const result = await actionPinToday(msg.id);
      showToast("📌 Đã ghim vào Hôm nay!");
    } catch {
      showToast("Lỗi khi ghim.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="p-8 text-sm text-zinc-400">Đang tải…</p>;
  }

  if (!msg) {
    return (
      <div className="p-8">
        <p className="text-zinc-400">Không tìm thấy tin nhắn.</p>
        <Link href="/exchange" className="mt-4 inline-block text-sm text-emerald-400 hover:underline">
          ← Quay lại hộp thư
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link href="/exchange" className="text-sm text-zinc-400 hover:text-white">
          ← Hộp thư
        </Link>
      </div>

      {/* Message card */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {TAG_LABELS[msg.tag] ?? msg.tag}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                msg.status === "unread"
                  ? "bg-blue-500/20 text-blue-300"
                  : msg.status === "replied"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-zinc-700 text-zinc-400"
              }`}
            >
              {msg.status === "unread"
                ? "Chưa đọc"
                : msg.status === "replied"
                ? "Đã phản hồi"
                : "Đã đọc"}
            </span>
            {msg.pinned && (
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                📌 Đã ghim
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500">
            {new Date(msg.created_at).toLocaleString("vi-VN")}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {msg.content}
        </p>

        {msg.student_quick_reply && (
          <div className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
            Bạn đã phản hồi:{" "}
            <strong>
              {QUICK_REPLIES.find((r) => r.value === msg.student_quick_reply)?.label ??
                msg.student_quick_reply}
            </strong>
            {msg.student_reply_text && (
              <span className="ml-1 text-zinc-400">— {msg.student_reply_text}</span>
            )}
          </div>
        )}

        <button
          onClick={handlePin}
          className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
        >
          {msg.pinned ? "📌 Bỏ ghim" : "📌 Ghim tin nhắn"}
        </button>
      </div>

      {/* Quick reply */}
      {msg.status !== "replied" && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Phản hồi nhanh</h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r.value}
                onClick={() => handleQuickReply(r.value)}
                disabled={replying}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                {r.label}
              </button>
            ))}
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Phản hồi thêm (tuỳ chọn)…"
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">
          🚀 Biến tin nhắn thành hành động
        </h2>

        {/* Create task */}
        <button
          onClick={handleCreateTask}
          disabled={actionLoading === "create-task"}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors disabled:opacity-50 text-left"
        >
          📝 Tạo nhiệm vụ từ tin nhắn này
        </button>

        {/* Create session */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCreateSession(25)}
            disabled={actionLoading === "session-25"}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            ⏱ Tạo phiên 25 phút
          </button>
          <button
            onClick={() => handleCreateSession(45)}
            disabled={actionLoading === "session-45"}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            ⏱ Tạo phiên 45 phút
          </button>
        </div>

        {/* Pin to today */}
        <button
          onClick={handlePinToday}
          disabled={actionLoading === "pin-today"}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-yellow-500 hover:text-yellow-300 transition-colors disabled:opacity-50 text-left"
        >
          📌 Ghim vào Hôm nay
        </button>

        {/* Add checklist item */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">Thêm vào checklist của nhiệm vụ:</p>
            <div className="flex gap-2">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500"
              >
                <option value="">Chọn nhiệm vụ…</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                value={checklistItem}
                onChange={(e) => setChecklistItem(e.target.value)}
                placeholder="Nội dung checklist…"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAddChecklist}
                disabled={
                  !selectedTaskId ||
                  !checklistItem.trim() ||
                  actionLoading === "add-checklist"
                }
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-500 disabled:opacity-50"
              >
                Thêm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
