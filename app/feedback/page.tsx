"use client";

import { FormEvent, useEffect, useState } from "react";
import { listFeedback, saveFeedback } from "@/src/lib/storage/feedbackRepo";
import { getLatestPlan } from "@/src/lib/storage/planRepo";
import { Feedback } from "@/src/lib/types";

const quickFeedback = [
  { label: "too_dense", text: "Quá dày / không học nổi" },
  { label: "too_easy", text: "Học nhanh hơn dự kiến" },
  { label: "need_more_time", text: "Môn này khó, cần thêm" },
  { label: "evening_focus", text: "Buổi tối không tập trung" },
] as const;

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [note, setNote] = useState("");
  const [planVersion, setPlanVersion] = useState(0);

  const refresh = async () => {
    const [records, plan] = await Promise.all([listFeedback(), getLatestPlan()]);
    setFeedback(records.slice(-5).reverse());
    setPlanVersion(plan?.planVersion ?? 0);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (label: Feedback["label"], event?: FormEvent) => {
    event?.preventDefault();
    await saveFeedback({ label, note, planVersion });
    setNote("");
    refresh();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Phản hồi sau khi học</h1>
        <p className="text-sm text-zinc-400">AI sẽ dựa vào phản hồi để điều chỉnh buffer, độ dài session, giờ vàng.</p>
      </header>
      <section className="card space-y-3">
        <p className="text-sm text-zinc-400">Plan đang dùng: v{planVersion}</p>
        <div className="grid grid-cols-2 gap-3">
          {quickFeedback.map((item) => (
            <button
              key={item.label}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-left text-sm hover:border-emerald-400"
              onClick={() => handleSubmit(item.label)}
            >
              {item.text}
            </button>
          ))}
        </div>
        <form className="space-y-2" onSubmit={(event) => handleSubmit("custom", event)}>
          <textarea
            className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
            placeholder="Ghi chú thêm (ví dụ: Sáng linh hoạt hơn buổi tối)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-black" type="submit">
            Gửi phản hồi riêng
          </button>
        </form>
      </section>
      <section className="card space-y-2">
        <h2 className="font-semibold">Phản hồi gần đây</h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có phản hồi.</p>
        ) : (
          <ul className="space-y-2 text-sm text-zinc-300">
            {feedback.map((item) => (
              <li key={item.id} className="rounded-lg border border-zinc-700/60 p-3">
                <p className="font-semibold">{quickFeedback.find((q) => q.label === item.label)?.text ?? "Ghi chú"}</p>
                {item.note && <p className="text-xs text-zinc-400">{item.note}</p>}
                <p className="text-[11px] text-zinc-500">Plan v{item.planVersion} · {new Date(item.submittedAt).toLocaleString("vi-VN")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
