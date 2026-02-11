"use client";

import { FormEvent, useEffect, useState } from "react";
import { taskSchema, TaskFormValues } from "@/src/lib/validation/taskSchema";
import { listTasks, saveTask, deleteTask } from "@/src/lib/storage/tasksRepo";
import { Task } from "@/src/lib/types";

const defaultForm: TaskFormValues = {
  subject: "",
  title: "",
  deadline: "",
  difficulty: 3,
  estimatedMinutes: 60,
  importance: undefined,
  contentFocus: "",
  successCriteria: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formValues, setFormValues] = useState<TaskFormValues>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    (async () => setTasks(await listTasks()))();
  }, []);

  const refresh = async () => {
    setTasks(await listTasks());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    const parsed = taskSchema.safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      Object.entries(parsed.error.formErrors.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages[0]) fieldErrors[field] = messages[0];
      });
      setErrors(fieldErrors);
      return;
    }
    await saveTask(parsed.data);
    setFormValues(defaultForm);
    setErrors({});
    setStatus("Đã lưu nhiệm vụ.");
    refresh();
  };

  const handleChange = (field: keyof TaskFormValues, value: string | number | undefined) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nhiệm vụ học tập</h1>
        <p className="text-sm text-zinc-400">
          Nhập nhiệm vụ thật với đầy đủ deadline, độ khó và tiêu chí. Mọi lỗi sẽ hiện ngay dưới ô nhập.
        </p>
      </header>
      <section className="card">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Môn học*</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Ví dụ: Toán"
            />
            {errors.subject && <p className="text-sm text-red-400">{errors.subject}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Tên nhiệm vụ*</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ôn kiểm tra chương 3"
            />
            {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Deadline*</label>
            <input
              type="datetime-local"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
            />
            {errors.deadline ? (
              <p className="text-sm text-red-400">{errors.deadline}</p>
            ) : (
              <p className="text-xs text-zinc-500">Không nhận deadline quá khứ. Nếu quên giờ sẽ tự đặt 23:59.</p>
            )}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Độ khó (1-5)*</label>
            <input
              type="number"
              min={1}
              max={5}
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.difficulty}
              onChange={(e) => handleChange("difficulty", Number(e.target.value))}
            />
            {errors.difficulty && <p className="text-sm text-red-400">{errors.difficulty}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Thời lượng (phút)*</label>
            <input
              type="number"
              min={10}
              max={600}
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.estimatedMinutes}
              onChange={(e) => handleChange("estimatedMinutes", Number(e.target.value))}
            />
            {errors.estimatedMinutes ? (
              <p className="text-sm text-red-400">{errors.estimatedMinutes}</p>
            ) : (
              <p className="text-xs text-zinc-500">Giữ trong 10-600 phút để kế hoạch thực tế.</p>
            )}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Mức quan trọng (1-3)</label>
            <input
              type="number"
              min={1}
              max={3}
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.importance ?? ""}
              onChange={(e) =>
                handleChange(
                  "importance",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )}
            />
            {errors.importance && <p className="text-sm text-red-400">{errors.importance}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Học gì (optional)</label>
            <textarea
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.contentFocus}
              onChange={(e) => handleChange("contentFocus", e.target.value)}
              placeholder="Ví dụ: Giải 3 dạng chính, note lỗi hay gặp"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Tiêu chí thành công</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.successCriteria}
              onChange={(e) => handleChange("successCriteria", e.target.value)}
              placeholder=">= 8/10 câu đúng"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black"
          >
            Lưu nhiệm vụ
          </button>
          {status && <p className="text-sm text-emerald-400">{status}</p>}
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Danh sách nhiệm vụ</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có nhiệm vụ. Hãy nhập ít nhất 1 task.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-zinc-700/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">{task.subject}</p>
                    <p className="text-lg font-semibold">{task.title}</p>
                    <p className="text-sm text-zinc-400">
                      Deadline {new Date(task.deadline).toLocaleString("vi-VN")} · Độ khó {task.difficulty}
                    </p>
                  </div>
                  <button
                    className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300"
                    onClick={() => {
                      deleteTask(task.id).then(refresh);
                    }}
                  >
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
