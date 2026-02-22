"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parentGetChildTasks, parentGetLinkedStudents, LinkedStudentInfo } from "@/src/lib/api/parent";
import { Task } from "@/src/lib/types";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Rất dễ", 2: "Dễ", 3: "Trung bình", 4: "Khó", 5: "Rất khó",
};

const SUBJECT_LABEL: Record<string, string> = {
  toan: "Toán", ngu_van: "Ngữ văn", tieng_anh: "Tiếng Anh",
  lich_su: "Lịch sử", dia_li: "Địa lí",
};

export default function ChildTasksPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [student, setStudent] = useState<LinkedStudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      parentGetChildTasks(studentId),
      parentGetLinkedStudents(),
    ])
      .then(([taskData, students]) => {
        setTasks(taskData as Task[]);
        const found = students.find((s) => s.student_id === studentId);
        setStudent(found ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [studentId]);

  const studentLabel = student ? `${student.full_name} (@${student.username})` : "Học sinh";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title={`Nhiệm vụ của ${studentLabel}`}
        breadcrumbs={[
          { label: "Phụ huynh", href: "/parent" },
          { label: studentLabel },
          { label: "Nhiệm vụ" },
        ]}
      />

      {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          icon="📚"
          title="Học sinh chưa có nhiệm vụ nào"
          description="Khi học sinh tạo nhiệm vụ, chúng sẽ hiện lên ở đây."
        />
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const deadlineDate = new Date(task.deadline);
            const isOverdue = deadlineDate < new Date() && task.progressMinutes < task.estimatedMinutes;
            const pct = task.estimatedMinutes > 0
              ? Math.min(100, Math.round((task.progressMinutes / task.estimatedMinutes) * 100))
              : 0;
            return (
              <div key={task.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">
                      {SUBJECT_LABEL[task.subject] ?? task.subject}
                    </span>
                    {task.lockedByParent && (
                      <span className="rounded bg-amber-600/20 px-1.5 py-0.5 text-xs text-amber-300">
                        🔒 Đã khoá
                      </span>
                    )}
                  </div>
                  <span className={`text-xs shrink-0 ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
                    Hạn: {deadlineDate.toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="font-medium text-zinc-100">{task.title}</p>
                <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span>Độ khó: {DIFFICULTY_LABEL[task.difficulty] ?? task.difficulty}</span>
                  <span>Ước tính: {task.estimatedMinutes} phút</span>
                  <span>Tiến độ: {pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800">
                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
