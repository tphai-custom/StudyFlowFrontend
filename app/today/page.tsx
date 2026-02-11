"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { getLatestPlan, updateSessionStatus } from "@/src/lib/storage/planRepo";
import { Session } from "@/src/lib/types";

export default function TodayPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [status, setStatus] = useState<string>("");

  const refresh = async () => {
    const plan = await getLatestPlan();
    const todayKey = new Date().toISOString().slice(0, 10);
    const filtered = plan?.sessions.filter((session) => session.plannedStart.startsWith(todayKey)) ?? [];
    setSessions(filtered);
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleSession = async (session: Session) => {
    const nextStatus = session.status === "done" ? "pending" : "done";
    await updateSessionStatus(session.id, nextStatus);
    setStatus(`Đã cập nhật ${session.title}`);
    refresh();
  };

  const skipDay = async () => {
    await Promise.all(sessions.map((session) => updateSessionStatus(session.id, "skipped")));
    setStatus("Đã đánh dấu bận hôm nay. Hãy tạo lại plan nếu cần.");
    refresh();
  };

  const totalMinutes = useMemo(() => sessions.reduce((sum, session) => sum + session.minutes, 0), [sessions]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hôm nay cần làm gì?</h1>
          <p className="text-sm text-zinc-400">Tích từng phiên để đo tiến độ. Tổng {totalMinutes} phút.</p>
          {status && <p className="text-xs text-emerald-400">{status}</p>}
        </div>
        <button className="rounded-xl border border-zinc-600 px-4 py-2 text-sm" onClick={skipDay}>
          Tôi bận hôm nay
        </button>
      </header>
      <section className="card space-y-3">
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có session nào. Hãy tạo kế hoạch.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between rounded-lg border border-zinc-700/60 p-3">
                <div>
                  <p className="text-sm text-zinc-400">{session.subject}</p>
                  <p className="text-lg font-semibold">{session.title}</p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(session.plannedStart), "HH:mm")} · {session.minutes} phút · Tiêu chí: {session.successCriteria ?? "Hoàn thành buổi"}
                  </p>
                </div>
                <button
                  className={`rounded-lg border px-3 py-1 text-sm ${
                    session.status === "done"
                      ? "border-emerald-400 text-emerald-300"
                      : "border-zinc-600 text-zinc-200"
                  }`}
                  onClick={() => toggleSession(session)}
                >
                  {session.status === "done" ? "Đã xong" : "Đánh dấu xong"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
