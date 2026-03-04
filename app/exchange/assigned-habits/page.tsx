"use client";

import { useEffect, useState } from "react";
import {
  studentListAssignedHabits,
  studentTickHabit,
  AssignedHabit,
} from "@/src/lib/api/assigned";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";
import { triggerBadgeRefresh } from "@/src/components/SidebarNav";

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
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            d.done ? "bg-emerald-400" : "bg-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

export default function StudentAssignedHabitsPage() {
  const [habits, setHabits] = useState<AssignedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    studentListAssignedHabits()
      .then(setHabits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTick = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit?.ticked_today) return;
    try {
      const updated = await studentTickHabit(habitId);
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? updated : h)),
      );
      showToast("✅ Đã tick thói quen hôm nay!");
      triggerBadgeRefresh();
    } catch {
      showToast("Lỗi khi ghi nhận thói quen.");
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
        title="Thói quen được giao"
        description="Thói quen phụ huynh muốn bạn duy trì hàng ngày."
      />

      {habits.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Chưa có thói quen được giao"
          description="Khi phụ huynh giao thói quen, chúng sẽ hiện ở đây."
        />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`rounded-xl border p-4 space-y-3 ${
                habit.ticked_today
                  ? "border-emerald-700/50 bg-emerald-950/10"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              {/* Top row: name + tick button */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-white">{habit.name}</h3>
                    {habit.locked ? (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                        🔒 Bắt buộc
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                        💡 Đề xuất
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                    <span>{FREQ_LABELS[habit.frequency_type] ?? habit.frequency_type}</span>
                    <span>{habit.minutes} phút</span>
                    {habit.suggested_time && <span>Gợi ý: {habit.suggested_time}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleTick(habit.id)}
                  disabled={habit.ticked_today}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    habit.ticked_today
                      ? "bg-green-600/50 text-green-300 cursor-default"
                      : "bg-zinc-700 text-zinc-300 hover:bg-emerald-600 hover:text-black"
                  }`}
                >
                  {habit.ticked_today ? "✅ Xong" : "Tick hôm nay"}
                </button>
              </div>

              {/* Streak + 7-day dots */}
              <div className="flex items-center gap-4 flex-wrap">
                {(habit.streak ?? 0) > 0 && (
                  <span className="text-[12px] text-orange-400 font-medium">
                    🔥 {habit.streak} ngày liên tiếp
                  </span>
                )}
                <SevenDayDots days={habit.last_7_days ?? []} />
              </div>

              {/* Ticked time */}
              {habit.ticked_today && habit.ticked_at && (
                <p className="text-[11px] text-emerald-400">
                  ✅ Đã làm lúc{" "}
                  {new Date(habit.ticked_at).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
