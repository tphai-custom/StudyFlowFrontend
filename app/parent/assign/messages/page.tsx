"use client";

import { useEffect, useState } from "react";
import {
  parentSendMessage,
  parentListMessages,
  ExchangeMessage,
} from "@/src/lib/api/exchange";
import { parentGetLinkedStudents, LinkedStudentInfo } from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const TAG_OPTIONS = [
  { value: "motivation", label: "💪 Động lực" },
  { value: "reminder", label: "🔔 Nhắc nhở" },
  { value: "praise", label: "🌟 Khen ngợi" },
  { value: "suggestion", label: "💡 Gợi ý" },
  { value: "other", label: "💬 Khác" },
];

const STATUS_LABEL: Record<string, string> = {
  unread: "Chưa đọc",
  read: "Đã đọc",
  replied: "Đã phản hồi",
};

const QUICK_REPLY_LABELS: Record<string, string> = {
  LIKE: "👍 Con hiểu rồi",
  DO_TODAY: "✅ Con sẽ làm hôm nay",
  RESCHEDULE: "🕒 Con xin dời sang mai",
  NEED_HELP: "❓ Con cần giúp",
};

export default function ParentAssignMessagesPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [messages, setMessages] = useState<ExchangeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [tag, setTag] = useState("reminder");
  const [sending, setSending] = useState(false);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    parentGetLinkedStudents()
      .then((data) => {
        setStudents(data);
        if (data.length > 0) setSelectedStudentId(data[0].student_id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    parentListMessages(selectedStudentId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [selectedStudentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !content.trim()) return;
    setSending(true);
    try {
      const sent = await parentSendMessage(selectedStudentId, content.trim(), tag);
      setMessages((prev) => [sent, ...prev]);
      setContent("");
      showToast("✅ Đã gửi tin nhắn!");
    } catch {
      showToast("Lỗi khi gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <PageHeader
        title="Tin nhắn cho con"
        description="Gửi nhắc nhở, động lực, khen ngợi hoặc gợi ý cho con."
      />

      {students.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {students.map((s) => (
            <button
              key={s.student_id}
              onClick={() => setSelectedStudentId(s.student_id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedStudentId === s.student_id
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải…</p>
      ) : students.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa liên kết với học sinh nào"
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Compose */}
          <form onSubmit={handleSend} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTag(t.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    tag === t.value
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung tin nhắn…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {sending ? "Đang gửi…" : "Gửi tin nhắn"}
              </button>
            </div>
          </form>

          {/* History */}
          {messages.length === 0 ? (
            <EmptyState icon="📭" title="Chưa có tin nhắn nào" />
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-zinc-500">
                        {TAG_OPTIONS.find((t) => t.value === msg.tag)?.label ?? msg.tag}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          msg.status === "replied"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : msg.status === "read"
                            ? "bg-zinc-700 text-zinc-400"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {STATUS_LABEL[msg.status] ?? msg.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(msg.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{msg.content}</p>
                  {msg.student_quick_reply && (
                    <p className="text-xs text-emerald-400 italic">
                      Con phản hồi: {QUICK_REPLY_LABELS[msg.student_quick_reply] ?? msg.student_quick_reply}
                      {msg.student_reply_text && ` — ${msg.student_reply_text}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
