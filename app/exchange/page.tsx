"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { studentListMessages, ExchangeMessage } from "@/src/lib/api/exchange";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const TAG_LABELS: Record<string, string> = {
  motivation: "💪 Động lực",
  reminder: "🔔 Nhắc nhở",
  praise: "🌟 Khen ngợi",
  suggestion: "💡 Gợi ý",
  other: "💬 Khác",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  unread: { label: "Chưa đọc", color: "bg-red-500/20 text-red-300" },
  read: { label: "Cần phản hồi", color: "bg-yellow-500/20 text-yellow-300" },
  replied: { label: "Đã phản hồi", color: "bg-emerald-500/20 text-emerald-300" },
};

type FilterTab = "all" | "unread" | "needs_action" | "done";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "needs_action", label: "Cần phản hồi" },
  { key: "done", label: "Đã xong" },
];

export default function ExchangeInboxPage() {
  const [messages, setMessages] = useState<ExchangeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    setLoading(true);
    studentListMessages(filter)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      <PageHeader
        title={`Hộp thư ${unreadCount > 0 ? `(${unreadCount} chưa đọc)` : ""}`}
        description="Tin nhắn, nhắc nhở và gợi ý từ phụ huynh."
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-emerald-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải…</p>
      ) : messages.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Không có tin nhắn"
          description="Phụ huynh chưa gửi tin nhắn nào."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const st = STATUS_LABELS[msg.status] ?? STATUS_LABELS.read;
            return (
              <Link
                key={msg.id}
                href={`/exchange/${msg.id}`}
                className={`block rounded-xl border p-4 transition-colors hover:border-zinc-600 ${
                  msg.status === "unread"
                    ? "border-red-500/40 bg-red-950/10"
                    : msg.status === "read"
                    ? "border-yellow-500/30 bg-yellow-950/10"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                      {TAG_LABELS[msg.tag] ?? msg.tag}
                    </span>
                    {msg.pinned && (
                      <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[11px] text-yellow-400">
                        📌 Đã ghim
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed line-clamp-2 ${
                    msg.status === "unread" ? "font-medium text-white" : "text-zinc-300"
                  }`}
                >
                  {msg.content}
                </p>
                {msg.replied_at && (
                  <p className="mt-1 text-[11px] text-emerald-400">
                    ✅ Đã phản hồi lúc{" "}
                    {new Date(msg.replied_at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
