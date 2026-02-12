"use client";

import { FormEvent, useEffect, useState } from "react";
import { listHabits, saveHabit, deleteHabit } from "@/src/lib/storage/habitsRepo";
import { rebuildPlan } from "@/src/lib/planner/planService";
import { Habit } from "@/src/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [form, setForm] = useState({ name: "", cadence: "daily", minutes: 15, weekday: 1 });
  const [status, setStatus] = useState<string>("");

  const refresh = async () => setHabits(await listHabits());

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveHabit({
      name: form.name,
      cadence: form.cadence as Habit["cadence"],
      minutes: form.minutes,
      weekday: form.cadence === "weekly" ? form.weekday : undefined,
    });
    setForm({ name: "", cadence: "daily", minutes: 15, weekday: 1 });
    await refresh();
    await rebuildPlan();
    setStatus("Đã lưu habit và cập nhật kế hoạch.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Habits & Break presets</h1>
        <p className="text-sm text-zinc-400">Thêm thói quen ngắn và preset nghỉ để planner tự chèn.</p>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
      </header>
      <section className="card">
        <form className="grid gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
          <input
            className="rounded-lg border border-zinc-700 bg-transparent p-2"
            placeholder="Tên habit"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="rounded-lg border border-zinc-700 bg-transparent p-2"
            value={form.cadence}
            onChange={(e) => setForm((prev) => ({ ...prev, cadence: e.target.value }))}
          >
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
          </select>
          {form.cadence === "weekly" && (
            <select
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.weekday}
              onChange={(e) => setForm((prev) => ({ ...prev, weekday: Number(e.target.value) }))}
            >
              <option value={1}>Thứ 2</option>
              <option value={2}>Thứ 3</option>
              <option value={3}>Thứ 4</option>
              <option value={4}>Thứ 5</option>
              <option value={5}>Thứ 6</option>
              <option value={6}>Thứ 7</option>
              <option value={0}>Chủ nhật</option>
            </select>
          )}
          <input
            type="number"
            min={5}
            max={120}
            className="rounded-lg border border-zinc-700 bg-transparent p-2"
            value={form.minutes}
            onChange={(e) => setForm((prev) => ({ ...prev, minutes: Number(e.target.value) }))}
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu habit
          </button>
        </form>
      </section>
      <section className="card space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có thói quen nào.</p>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => (
              <li key={habit.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3">
                <div>
                  <p className="font-semibold">{habit.name}</p>
                  <p className="text-xs text-zinc-500">
                    {habit.cadence === "daily"
                      ? "Hàng ngày"
                      : habit.weekday === 0
                        ? "Chủ nhật"
                        : `Thứ ${(habit.weekday ?? 0) + 1}`}
                    {" "}· {habit.minutes} phút
                  </p>
                </div>
                <button
                  className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300"
                  onClick={async () => {
                    await deleteHabit(habit.id);
                    await refresh();
                    await rebuildPlan();
                    setStatus("Đã xóa habit và cập nhật kế hoạch.");
                  }}
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
