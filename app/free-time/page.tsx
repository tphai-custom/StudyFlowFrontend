"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { listSlots, saveSlot, deleteSlot } from "@/src/lib/storage/slotsRepo";
import { FreeSlot } from "@/src/lib/types";
import { cleanSlots } from "@/src/lib/planner/cleanSlots";

const weekdayOptions = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const getWeekdayLabel = (value: number) => weekdayOptions.find((item) => item.value === value)?.label ?? "Chủ nhật";

export default function FreeTimePage() {
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [form, setForm] = useState({ weekday: 1, startTime: "19:00", endTime: "20:30" });
  const [error, setError] = useState<string>("");
  const [slotHistory, setSlotHistory] = useState<FreeSlot[][]>([]);
  const [cleaningReport, setCleaningReport] = useState<string[]>([]);

  const refresh = async () => setSlots(await listSlots());

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await saveSlot(form);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được slot");
    }
  };

  const handleClean = async () => {
    // Save current slots to history before cleaning
    setSlotHistory([...slotHistory, slots]);
    
    const result = cleanSlots(slots);
    setCleaningReport(result.warnings);
    
    // Update the slots list to show cleaned version
    // Note: In a real implementation, you'd save these back to storage
  };

  const handleUndo = () => {
    if (slotHistory.length > 0) {
      const previousSlots = slotHistory[slotHistory.length - 1];
      setSlots(previousSlots);
      setSlotHistory(slotHistory.slice(0, -1));
      setCleaningReport([]);
    }
  };

  const cleaned = useMemo(() => cleanSlots(slots), [slots]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Giờ rảnh mỗi tuần</h1>
        <p className="text-sm text-zinc-400">Chỉ những slot hợp lệ mới được dùng tạo kế hoạch.</p>
      </header>
      
      <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-sm text-sky-200">
        💡 <strong>Mẹo:</strong> Dùng phím Tab để di chuyển giữa các trường nhanh hơn. Slot sẽ được tự động làm sạch (gộp, cắt, làm tròn) trước khi xếp lịch.
      </div>

      <section className="card">
        <form className="grid gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="text-sm">Thứ</label>
            <select
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.weekday}
              onChange={(e) => setForm((prev) => ({ ...prev, weekday: Number(e.target.value) }))}
            >
              {weekdayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Bắt đầu</label>
            <input
              type="time"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.startTime}
              onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value || "00:00" }))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Kết thúc</label>
            <input
              type="time"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.endTime}
              onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value || "00:00" }))}
            />
          </div>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu slot
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <p className="mt-2 text-xs text-zinc-500">Slot kết thúc trước bắt đầu sẽ bị chặn ngay.</p>
      </section>
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Slot đã nhập</h2>
          {slotHistory.length > 0 && (
            <button
              className="rounded-lg border border-yellow-500/50 px-3 py-1 text-sm text-yellow-300 hover:bg-yellow-500/10"
              onClick={handleUndo}
            >
              ↺ Hoàn tác
            </button>
          )}
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có slot. Hãy thêm thời gian rảnh thật sự.</p>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3">
                <div>
                  <p className="text-sm font-semibold">
                    {getWeekdayLabel(slot.weekday)} {slot.startTime}–{slot.endTime}
                  </p>
                  <p className="text-xs text-zinc-500">{slot.capacityMinutes} phút</p>
                </div>
                <button
                  className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300"
                  onClick={() => deleteSlot(slot.id).then(refresh)}
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Sau khi làm sạch</h2>
        <p className="text-xs text-zinc-500">
          Hệ thống tự động gộp slot trùng, cắt slot quá dài (&gt;3 giờ), và làm tròn phút lẻ.
        </p>
        {cleaned.slots.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có slot hợp lệ.</p>
        ) : (
          <ul className="space-y-2">
            {cleaned.slots.map((slot) => (
              <li key={`${slot.weekday}-${slot.startTime}`} className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-sm font-semibold">
                  {getWeekdayLabel(slot.weekday)} {slot.startTime}–{slot.endTime}
                </p>
                <p className="text-xs text-zinc-500">Sử dụng {slot.capacityMinutes} phút</p>
              </li>
            ))}
          </ul>
        )}
        {cleaned.warnings.length > 0 && (
          <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 p-3 text-sm text-yellow-200">
            {cleaned.warnings.map((warning, index) => (
              <p key={`${warning}-${index}`}>{warning}</p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
