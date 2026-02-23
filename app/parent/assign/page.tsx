"use client";

import { useEffect, useState } from "react";
import {
  parentCreateAssignedTask,
  parentListAssignedTasks,
  parentUpdateAssignedTask,
  AssignedTask,
} from "@/src/lib/api/assigned";
import {
  parentGetLinkedStudents,
  LinkedStudentInfo,
} from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  ASSIGNED: { label: "Đã giao", color: "bg-blue-500/20 text-blue-300" },
  SEEN: { label: "Con đã xem", color: "bg-zinc-700 text-zinc-400" },
  ACCEPTED: { label: "Con đã nhận", color: "bg-emerald-500/20 text-emerald-300" },
  INPROGRESS: { label: "Đang làm", color: "bg-yellow-500/20 text-yellow-300" },
  DONE: { label: "Con xong", color: "bg-green-500/20 text-green-300" },
  VERIFIED: { label: "Đã xác nhận", color: "bg-purple-500/20 text-purple-300" },
  ARCHIVED: { label: "Lưu trữ", color: "bg-zinc-700 text-zinc-500" },
};

export default function ParentAssignTasksPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    deadline: "",
    priority: 2,
    tag: "study",
    locked: false,
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

  useEffect(() => {
    if (!selectedStudentId) return;
    parentListAssignedTasks(selectedStudentId)
      .then(setTasks)
      .catch(() => setTasks([]));
  }, [selectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !form.title.trim()) return;
    try {
      const created = await parentCreateAssignedTask(selectedStudentId, {
        title: form.title,
        subject: form.subject || undefined,
        description: form.description || undefined,
        deadline: form.deadline || undefined,
        priority: form.priority,
        tag: form.tag,
        locked: form.locked,
      });
      setTasks((prev) => [created, ...prev]);
      setForm({ title: "", subject: "", description: "", deadline: "", priority: 2, tag: "study", locked: false });
      setFormOpen(false);
      showToast("✅ Đã giao nhiệm vụ!");
    } catch {
      showToast("Lỗi khi giao nhiệm vụ.");
    }
  };

  const handleArchive = async (taskId: string) => {
    try {
      const updated = await parentUpdateAssignedTask(taskId, { status: "ARCHIVED" });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast("Đã lưu trữ nhiệm vụ.");
    } catch {
      showToast("Lỗi khi lưu trữ.");
    }
  };

  const handleVerify = async (taskId: string) => {
    try {
      const updated = await parentUpdateAssignedTask(taskId, { status: "VERIFIED" });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast("✅ Đã xác nhận hoàn thành!");
    } catch {
      showToast("Lỗi khi xác nhận.");
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
        title="Giao nhiệm vụ"
        description="Tạo và theo dõi nhiệm vụ bạn giao cho con em."
        actions={
          students.length > 0 ? (
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              + Giao nhiệm vụ mới
            </button>
          ) : undefined
        }
      />

      {/* Student selector */}
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
          description="Hãy thêm liên kết con em trước khi giao nhiệm vụ."
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Create form */}
          {formOpen && (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4"
            >
              <h2 className="text-sm font-semibold text-zinc-300">Nhiệm vụ mới</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Tiêu đề *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Vd: Ôn tập Toán chương 3"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Môn</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Toán, Văn, Anh…"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Hạn chót</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  >
                    <option value={1}>🟢 Thấp</option>
                    <option value={2}>🟡 Vừa</option>
                    <option value={3}>🔴 Cao</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Tag</label>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  >
                    <option value="study">Học</option>
                    <option value="practice">Luyện đề</option>
                    <option value="read">Đọc</option>
                    <option value="review">Ôn tập</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Thêm hướng dẫn cho con…"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.locked}
                      onChange={(e) => setForm((f) => ({ ...f, locked: e.target.checked }))}
                      className="rounded border-zinc-600 bg-zinc-800 accent-red-500"
                    />
                    <span className="text-xs text-zinc-300">
                      🔒 Bắt buộc (con không thể sửa/bỏ qua nội dung gốc)
                    </span>
                  </label>
                </div>
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
                  Giao nhiệm vụ
                </button>
              </div>
            </form>
          )}

          {/* Task list */}
          {tasks.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Chưa có nhiệm vụ nào được giao"
              description="Bấm '+ Giao nhiệm vụ mới' để bắt đầu."
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const st = STATUS_INFO[task.status] ?? { label: task.status, color: "bg-zinc-700 text-zinc-400" };
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-white">{task.title}</h3>
                          {task.locked && (
                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                              🔒 Bắt buộc
                            </span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        {task.subject && (
                          <p className="text-xs text-zinc-500">Môn: {task.subject}</p>
                        )}
                        {task.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2">{task.description}</p>
                        )}
                        {task.student_note && (
                          <p className="text-xs text-emerald-400 italic">
                            Con ghi: {task.student_note}
                          </p>
                        )}
                        {task.reschedule_requested_date && (
                          <p className="text-xs text-yellow-400">
                            Con xin dời: {task.reschedule_requested_date}
                            {task.reschedule_reason && ` — ${task.reschedule_reason}`}
                          </p>
                        )}
                        <div className="flex gap-3 text-[11px] text-zinc-500 flex-wrap">
                          {task.deadline && <span>Hạn: {task.deadline}</span>}
                          <span>
                            {new Date(task.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>

                      {/* Parent actions */}
                      <div className="flex gap-2 flex-wrap">
                        {task.status === "DONE" && (
                          <button
                            onClick={() => handleVerify(task.id)}
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500"
                          >
                            Xác nhận xong
                          </button>
                        )}
                        {task.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(task.id)}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500"
                          >
                            Thu hồi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
