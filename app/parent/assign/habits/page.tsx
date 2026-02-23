"use client";

import { useEffect, useState } from "react";
import {
  parentCreateAssignedHabit,
  parentListHabitsWithStatus,
  parentPraiseHabit,
  AssignedHabit,
} from "@/src/lib/api/assigned";
import { parentGetLinkedStudents, LinkedStudentInfo } from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const FREQ_LABELS: Record<string, string> = {
  daily: "Hàng ngày",
  "246": "Thứ 2-4-6",
  weekend: "Cuối tuần",
  custom: "Tuỳ chỉnh",
};

function SevenDayDots({ days }: { days: AssignedHabit["last_7_days"] }) {
  if (!days || days.length === 0) return null;
  return (
    <div className="flex items-center gap-1" title="7 ngày gần nhất">
      {days.map((d) => (
        <span
          key={d.date}
          title={d.date}
          className={`inline-block h-2 w-2 rounded-full ${
            d.done ? "bg-emerald-400" : "bg-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

export default function ParentAssignHabitsPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [habits, setHabits] = useState<AssignedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    frequency_type: "daily",
    minutes: 15,
    suggested_time: "",
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
    parentListHabitsWithStatus(selectedStudentId)
      .then(setHabits)
      .catch(() => setHabits([]));
  }, [selectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !form.name.trim()) return;
    try {
      const created = await parentCreateAssignedHabit(selectedStudentId, {
        name: form.name,
        frequency_type: form.frequency_type,
        minutes: form.minutes,
        suggested_time: form.suggested_time || undefined,
        locked: form.locked,
      });
      // Reload with status after creation
      const updated = await parentListHabitsWithStatus(selectedStudentId);
      setHabits(updated);
      void created;
      setForm({ name: "", frequency_type: "daily", minutes: 15, suggested_time: "", locked: false });
      setFormOpen(false);
      showToast("✅ Đã giao thói quen!");
    } catch {
      showToast("Lỗi khi giao thói quen.");
    }
  };

  const handlePraise = async (habitId: string) => {
    try {
      await parentPraiseHabit(habitId);
      showToast("🌟 Đã gửi tin nhắn khen đến con!");
    } catch {
      showToast("Lỗi khi gửi khen.");
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
        title="Giao thói quen"
        description="Tạo thói quen học tập cho con em duy trì hàng ngày."
        actions={
          students.length > 0 ? (
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              + Giao thói quen mới
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
              <h2 className="text-sm font-semibold text-zinc-300">Thói quen mới</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Tên thói quen *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Vd: Đọc sách 15 phút"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Tần suất</label>
                  <select
                    value={form.frequency_type}
                    onChange={(e) => setForm((f) => ({ ...f, frequency_type: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="246">Thứ 2-4-6</option>
                    <option value="weekend">Cuối tuần</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Thời lượng (phút)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={form.minutes}
                    onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Khung giờ gợi ý</label>
                  <input
                    type="time"
                    value={form.suggested_time}
                    onChange={(e) => setForm((f) => ({ ...f, suggested_time: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.locked}
                      onChange={(e) => setForm((f) => ({ ...f, locked: e.target.checked }))}
                      className="rounded border-zinc-600 bg-zinc-800 accent-red-500"
                    />
                    <span className="text-xs text-zinc-300">🔒 Bắt buộc</span>
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
                  Giao thói quen
                </button>
              </div>
            </form>
          )}

          {habits.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="Chưa có thói quen nào được giao"
              description="Bấm '+ Giao thói quen mới' để bắt đầu."
            />
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`rounded-xl border p-4 space-y-2 ${
                    habit.ticked_today
                      ? "border-emerald-700/40 bg-emerald-950/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-white">{habit.name}</h3>
                        {habit.ticked_today && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                            ✅ Đã làm hôm nay
                          </span>
                        )}
                        {habit.locked && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                            🔒 Bắt buộc
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-[11px] text-zinc-500 flex-wrap">
                        <span>{FREQ_LABELS[habit.frequency_type] ?? habit.frequency_type}</span>
                        <span>{habit.minutes} phút</span>
                        {habit.suggested_time && <span>Gợi ý: {habit.suggested_time}</span>}
                        <span
                          className={`rounded-full px-2 py-0.5 ${
                            habit.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {habit.status === "active" ? "Đang hoạt động" : "Lưu trữ"}
                        </span>
                      </div>
                      {/* Streak + 7-day dots */}
                      <div className="flex items-center gap-3 flex-wrap pt-0.5">
                        {(habit.streak ?? 0) > 0 && (
                          <span className="text-[11px] text-orange-400 font-medium">
                            🔥 {habit.streak} ngày liên tiếp
                          </span>
                        )}
                        <SevenDayDots days={habit.last_7_days ?? []} />
                      </div>
                    </div>
                    <button
                      onClick={() => handlePraise(habit.id)}
                      className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                    >
                      🌟 Khen con
                    </button>
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
