"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parentGetChildTasks } from "@/src/lib/api/parent";
import { Task } from "@/src/lib/types";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Rất dễ",
  2: "Dễ",
  3: "Trung bình",
  4: "Khó",
  5: "Rất khó",
};

const SUBJECT_LABEL: Record<string, string> = {
  toan: "Toán",
  ngu_van: "Ngữ văn",
  tieng_anh: "Tiếng Anh",
  lich_su: "Lịch sử",
  dia_li: "Địa lí",
};

export default function ChildTasksPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    parentGetChildTasks(studentId)
      .then((data) => setTasks(data as Task[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải nhiệm vụ"))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/parent" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Tổng quan
        </Link>
        <span className="text-zinc-600">/</span>
        <h1 className="text-xl font-bold">Nhiệm vụ của học sinh</h1>
      </div>

      <p className="text-xs text-zinc-500">Student ID: {studentId}</p>

      {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p className="text-sm text-zinc-400">Học sinh chưa có nhiệm vụ nào.</p>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const deadlineDate = new Date(task.deadline);
            const isOverdue = deadlineDate < new Date() && task.progressMinutes < task.estimatedMinutes;
            return (
              <div key={task.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="mr-2 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">
                      {SUBJECT_LABEL[task.subject] ?? task.subject}
                    </span>
                    {task.lockedByParent && (
                      <span className="rounded bg-amber-600/20 px-1.5 py-0.5 text-xs text-amber-300">
                        🔒 Đã khoá
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
                    Hạn: {deadlineDate.toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <p className="font-medium text-zinc-100">{task.title}</p>

                <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span>Độ khó: {DIFFICULTY_LABEL[task.difficulty] ?? task.difficulty}</span>
                  <span>
                    Ước tính: {task.estimatedMinutes} phút
                  </span>
                  <span>
                    Tiến độ: {task.progressMinutes} / {task.estimatedMinutes} phút
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.min(100, task.estimatedMinutes > 0 ? Math.round((task.progressMinutes / task.estimatedMinutes) * 100) : 0)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
