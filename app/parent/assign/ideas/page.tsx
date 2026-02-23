"use client";

import { useEffect, useState } from "react";
import {
  parentCreateIdea,
  Idea,
} from "@/src/lib/api/assigned";
import { parentGetLinkedStudents, LinkedStudentInfo } from "@/src/lib/api/parent";
import { apiGet } from "@/src/lib/api/client";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

export default function ParentAssignIdeasPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    content: "",
    suggested_type: "task",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !form.content.trim()) return;
    try {
      const created = await parentCreateIdea(selectedStudentId, {
        content: form.content,
        suggested_type: form.suggested_type,
      });
      setIdeas((prev) => [created, ...prev]);
      setForm({ content: "", suggested_type: "task" });
      setFormOpen(false);
      showToast("✅ Đã gửi đề xuất!");
    } catch {
      showToast("Lỗi khi gửi đề xuất.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <PageHeader
        title="Đề xuất nhẹ"
        description="Gợi ý nhẹ nhàng cho con — con có thể nhận hoặc để sau."
        actions={
          students.length > 0 ? (
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              + Gửi đề xuất
            </button>
          ) : undefined
        }
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
          {formOpen && (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4"
            >
              <h2 className="text-sm font-semibold text-zinc-300">Đề xuất mới</h2>
              <textarea
                required
                rows={3}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Vd: Tuần này thử dùng Pomodoro 45/10 xem sao con nhé…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Gợi ý chuyển thành</label>
                <select
                  value={form.suggested_type}
                  onChange={(e) => setForm((f) => ({ ...f, suggested_type: e.target.value }))}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                >
                  <option value="task">Nhiệm vụ</option>
                  <option value="habit">Thói quen</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
                >
                  Gửi đề xuất
                </button>
              </div>
            </form>
          )}

          {ideas.length === 0 ? (
            <EmptyState
              icon="💡"
              title="Chưa có đề xuất nào"
              description="Gửi đề xuất nhẹ nhàng cho con để con chủ động nhận."
            />
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-1"
                >
                  <p className="text-sm text-zinc-200">{idea.content}</p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5">
                      {idea.suggested_type === "task" ? "→ Nhiệm vụ" : "→ Thói quen"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        idea.status === "accepted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : idea.status === "later"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {idea.status === "accepted" ? "Con đã nhận" : idea.status === "later" ? "Con để sau" : "Chờ phản hồi"}
                    </span>
                    <span>{new Date(idea.created_at).toLocaleDateString("vi-VN")}</span>
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
