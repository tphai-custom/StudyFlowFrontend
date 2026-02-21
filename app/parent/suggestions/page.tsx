"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  parentListChildren,
  parentCreateSuggestion,
  parentListSuggestions,
  LinkSchema,
  SuggestionSchema,
} from "@/src/lib/api/parent";

export default function ParentSuggestionsPage() {
  const [children, setChildren] = useState<LinkSchema[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestionSchema[]>([]);
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    parentListChildren().then((links) => {
      setChildren(links);
      if (links.length > 0) setSelectedChild(links[0].student_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    parentListSuggestions(selectedChild).then(setSuggestions).catch(() => {});
  }, [selectedChild]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSubmitting(true);
    try {
      await parentCreateSuggestion(selectedChild, { type, message });
      setMsg("Đã gửi gợi ý thành công!");
      setMessage("");
      parentListSuggestions(selectedChild).then(setSuggestions).catch(() => {});
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Không thể gửi gợi ý");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "Chờ xử lý",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Gợi ý cho con em</h1>

      {children.length === 0 ? (
        <div className="card">
          <p className="text-sm text-zinc-400">Bạn chưa liên kết với học sinh nào.</p>
        </div>
      ) : (
        <>
          {/* Child selector */}
          <div className="card space-y-3">
            <h2 className="font-semibold">Chọn học sinh</h2>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              {children.map((link) => (
                <option key={link.student_id} value={link.student_id}>
                  {link.student_id}
                </option>
              ))}
            </select>
          </div>

          {/* New suggestion form */}
          <div className="card space-y-4">
            <h2 className="font-semibold">Gửi gợi ý mới</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-1">
                <label className="text-sm text-zinc-300">Loại gợi ý</label>
                <select
                  className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="general">Chung</option>
                  <option value="study_more">Học nhiều hơn</option>
                  <option value="reduce_load">Giảm tải</option>
                  <option value="focus_subject">Tập trung môn học</option>
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-zinc-300">Nội dung gợi ý</label>
                <textarea
                  className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập lời nhắn cho con em…"
                />
              </div>
              {msg && <p className="text-sm text-emerald-400">{msg}</p>}
              {err && <p className="text-sm text-red-400">{err}</p>}
              <button
                type="submit"
                disabled={submitting || !selectedChild}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {submitting ? "Đang gửi…" : "Gửi gợi ý"}
              </button>
            </form>
          </div>

          {/* Sent suggestions list */}
          <div className="card space-y-3">
            <h2 className="font-semibold">Gợi ý đã gửi</h2>
            {suggestions.length === 0 ? (
              <p className="text-sm text-zinc-400">Chưa có gợi ý nào.</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s) => (
                  <li key={s.id} className="rounded-lg bg-surface-muted p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase text-zinc-400">{s.type}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          s.status === "accepted"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : s.status === "rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {statusLabel[s.status] ?? s.status}
                      </span>
                    </div>
                    {s.message && <p className="text-sm text-zinc-300">{s.message}</p>}
                    <p className="text-xs text-zinc-500">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
