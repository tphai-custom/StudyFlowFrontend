"use client";

import { useState } from "react";
import { seedDemoData } from "@/src/lib/seed/demoData";
import { clearStore } from "@/src/lib/storage/db";

export default function DemoPage() {
  const [status, setStatus] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSeed = async () => {
    await seedDemoData();
    setStatus("✅ Đã tạo dữ liệu mẫu. Hãy vào các trang khác để xem (Nhiệm vụ, Thời gian rảnh, Kế hoạch).");
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
    setStatus("✅ Đã xoá toàn bộ dữ liệu demo.");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Demo nhanh</h1>
        <p className="text-sm text-zinc-400">
          Tạo dữ liệu mẫu (1 click) để BGK xem ngay luồng lập kế hoạch, không cần nhập tay.
        </p>
        {status && <p className="mt-2 text-sm text-emerald-400">{status}</p>}
      </header>

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Tạo dữ liệu mẫu</h2>
          <p className="text-sm text-zinc-300 mb-3">
            Bộ sample bao gồm: <strong>3 tasks</strong>, <strong>3 slots rảnh</strong>,{" "}
            <strong>2 habits</strong>, và <strong>2 tài liệu thư viện</strong>.
            Dữ liệu được thiết kế để demo tính năng "Không đủ thời gian" và "Gợi ý điều chỉnh".
          </p>
          <button
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black hover:bg-emerald-400"
            onClick={handleSeed}
          >
            🚀 Tạo sample data
          </button>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
          <h3 className="font-semibold mb-2">📋 Luồng demo gợi ý:</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>
              <strong>Bước 1:</strong> Bấm "Tạo sample data" ở trên
            </li>
            <li>
              <strong>Bước 2:</strong> Vào trang "Kế hoạch" → Bấm "Tạo kế hoạch"
            </li>
            <li>
              <strong>Bước 3:</strong> Xem phần "Không đủ thời gian" và "Gợi ý điều chỉnh"
            </li>
            <li>
              <strong>Bước 4:</strong> Bấm "Xuất .ics" để tải file lịch (import vào Google Calendar)
            </li>
            <li>
              <strong>Bước 5:</strong> Thử xem các trang khác: Nhiệm vụ, Thời gian rảnh, Hôm nay...
            </li>
          </ol>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Xóa dữ liệu demo</h2>
        <p className="text-sm text-zinc-400">
          Xóa toàn bộ tasks, slots, habits, library, plans để bắt đầu lại từ đầu.
        </p>
        {!showDeleteConfirm ? (
          <button
            className="rounded-xl border border-red-500/60 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ Xoá toàn bộ data demo
          </button>
        ) : (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-200">
              ⚠️ Xác nhận xóa toàn bộ dữ liệu demo?
            </p>
            <p className="text-sm text-red-300">
              Hành động này không thể hoàn tác. Tất cả tasks, slots, habits, library, plans sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-black hover:bg-red-400"
                onClick={handleReset}
              >
                Xác nhận xóa
              </button>
              <button
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
