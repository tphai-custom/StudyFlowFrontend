"use client";

import { useState } from "react";
import { seedDemoData } from "@/src/lib/seed/demoData";
import { clearStore } from "@/src/lib/storage/db";

export default function DemoPage() {
  const [status, setStatus] = useState<string>("");

  const handleSeed = async () => {
    await seedDemoData();
    setStatus("Đã seed tasks + slot + library. Mở các trang khác để xem.");
  };

  const handleReset = async () => {
    await Promise.all([
      clearStore("tasks"),
      clearStore("freeSlots"),
      clearStore("habits"),
      clearStore("library"),
      clearStore("plan"),
      clearStore("feedback"),
    ]);
    setStatus("Đã xoá dữ liệu demo.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Demo nhanh</h1>
        <p className="text-sm text-zinc-400">Seed dữ liệu mẫu để QA/PM test luồng chính.</p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>
      <section className="card space-y-3">
        <button className="rounded-xl bg-emerald-500 px-4 py-2 text-black" onClick={handleSeed}>
          Tạo sample data
        </button>
        <button className="rounded-xl border border-red-500/60 px-4 py-2 text-sm text-red-300" onClick={handleReset}>
          Xoá toàn bộ data demo
        </button>
        <p className="text-xs text-zinc-500">
          Bộ sample gồm 3 tasks, 3 slot rảnh, 2 habits, 2 tài liệu thư viện. Sau khi seed hãy vào Trình tạo kế hoạch.
        </p>
      </section>
    </div>
  );
}
