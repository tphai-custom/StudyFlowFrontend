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
  durationEstimateMin: 1,
  durationEstimateMax: 2,
  durationUnit: "hours",
  importance: undefined,
  contentFocus: "",
  successCriteria: ["Hoàn thành mục tiêu chính"],
  milestones: [],
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
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      Object.entries(flat.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages[0]) fieldErrors[field] = messages[0];
      });
      if (flat.formErrors[0]) {
        fieldErrors._form = flat.formErrors[0];
      }
      setErrors(fieldErrors);
      return;
    }
    await saveTask(parsed.data);
    setFormValues(defaultForm);
    setErrors({});
    setStatus("Đã lưu nhiệm vụ.");
    refresh();
  };

  const handleChange = (field: keyof TaskFormValues, value: string | number | undefined | TaskFormValues["successCriteria"] | TaskFormValues["milestones"]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const updateSuccessCriterion = (index: number, value: string) => {
    setFormValues((prev) => {
      const next = [...prev.successCriteria];
      next[index] = value;
      return { ...prev, successCriteria: next };
    });
  };

  const addSuccessCriterion = () => {
    setFormValues((prev) => ({ ...prev, successCriteria: [...prev.successCriteria, ""] }));
  };

  const removeSuccessCriterion = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      successCriteria: prev.successCriteria.filter((_, idx) => idx !== index),
    }));
  };

  const updateMilestone = (index: number, field: "title" | "minutesEstimate", value: string) => {
    setFormValues((prev) => {
      const next = prev.milestones ?? [];
      const draft = [...next];
      const target = draft[index] ?? { title: "", minutesEstimate: 30 };
      draft[index] = {
        ...target,
        [field]: field === "minutesEstimate" ? Number(value) : value,
      };
      return { ...prev, milestones: draft };
    });
  };

  const addMilestone = () => {
    setFormValues((prev) => ({
      ...prev,
      milestones: [...(prev.milestones ?? []), { title: "", minutesEstimate: 30 }],
    }));
  };

  const removeMilestone = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      milestones: (prev.milestones ?? []).filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nhiệm vụ học tập</h1>
        <p className="text-sm text-zinc-400">
          Nhập nhiệm vụ thật với đầy đủ deadline, độ khó và tiêu chí checklist. Mọi lỗi hiển thị ngay dưới trường nhập.
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
            <label className="text-sm text-zinc-300">Ước lượng thời gian*</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                min={1}
                className="w-24 rounded-lg border border-zinc-700 bg-transparent p-2"
                value={formValues.durationEstimateMin}
                onChange={(e) => handleChange("durationEstimateMin", Number(e.target.value))}
              />
              <span className="self-center text-sm text-zinc-500">–</span>
              <input
                type="number"
                min={1}
                className="w-24 rounded-lg border border-zinc-700 bg-transparent p-2"
                value={formValues.durationEstimateMax}
                onChange={(e) => handleChange("durationEstimateMax", Number(e.target.value))}
              />
              <select
                className="rounded-lg border border-zinc-700 bg-transparent p-2"
                value={formValues.durationUnit}
                onChange={(e) => handleChange("durationUnit", e.target.value as TaskFormValues["durationUnit"])}
              >
                <option value="hours">Giờ</option>
                <option value="minutes">Phút</option>
              </select>
            </div>
            {errors.durationEstimateMin && (
              <p className="text-sm text-red-400">{errors.durationEstimateMin}</p>
            )}
            {errors.durationEstimateMax && (
              <p className="text-sm text-red-400">{errors.durationEstimateMax}</p>
            )}
            <p className="text-xs text-zinc-500">Ví dụ: 6–8 giờ (StudyFlow sẽ chia nhỏ thành các phiên).</p>
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
          <div className="grid gap-2">
            <div>
              <label className="text-sm text-zinc-300">Tiêu chí thành công (checklist)*</label>
              <p className="text-xs text-zinc-500">Mỗi dòng là một tiêu chí. Planner sẽ hiển thị "Học gì – đạt gì".</p>
            </div>
            <div className="space-y-2">
              {formValues.successCriteria.map((criteria, index) => (
                <div key={`criteria-${index}`} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-zinc-700 bg-transparent p-2"
                    value={criteria}
                    onChange={(e) => updateSuccessCriterion(index, e.target.value)}
                    placeholder=">= 8/10 câu đúng"
                  />
                  {formValues.successCriteria.length > 1 && (
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/40 px-3 text-sm text-red-300"
                      onClick={() => removeSuccessCriterion(index)}
                    >
                      Xoá
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-emerald-400"
                onClick={addSuccessCriterion}
              >
                + Thêm tiêu chí
              </button>
              {errors.successCriteria && <p className="text-sm text-red-400">{errors.successCriteria}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <div>
              <label className="text-sm text-zinc-300">Milestones (tuỳ chọn)</label>
              <p className="text-xs text-zinc-500">Dùng để auto split ví dụ "Ôn công thức 60p".</p>
            </div>
            <div className="space-y-3">
              {(formValues.milestones ?? []).map((milestone, index) => (
                <div key={`milestone-${index}`} className="rounded-lg border border-zinc-700/60 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <input
                      className="rounded-lg border border-zinc-700 bg-transparent p-2"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                      placeholder="Tên mốc ví dụ Ôn công thức"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={480}
                        className="w-24 rounded-lg border border-zinc-700 bg-transparent p-2"
                        value={milestone.minutesEstimate}
                        onChange={(e) => updateMilestone(index, "minutesEstimate", e.target.value)}
                      />
                      <span className="text-xs text-zinc-500">phút</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-300"
                    onClick={() => removeMilestone(index)}
                  >
                    Xoá mốc này
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-emerald-400"
                onClick={addMilestone}
              >
                + Thêm milestone
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black"
          >
            Lưu nhiệm vụ
          </button>
          {errors._form && <p className="text-sm text-red-400">{errors._form}</p>}
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
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-zinc-500">{task.subject}</p>
                    <p className="text-lg font-semibold">{task.title}</p>
                    <p className="text-sm text-zinc-400">
                      Deadline {new Date(task.deadline).toLocaleString("vi-VN")} · Độ khó {task.difficulty}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(() => {
                        const minMinutes = task.durationEstimateMin ?? task.estimatedMinutes;
                        const maxMinutes = task.durationEstimateMax ?? task.estimatedMinutes;
                        const unit = task.durationUnit ?? "minutes";
                        if (unit === "hours") {
                          const minHours = (minMinutes / 60).toFixed(1);
                          const maxHours = (maxMinutes / 60).toFixed(1);
                          return `Ước lượng: ${minHours}–${maxHours} giờ`;
                        }
                        return `Ước lượng: ${minMinutes}–${maxMinutes} phút`;
                      })()}
                    </p>
                    <div>
                      <p className="text-xs text-zinc-500">Tiêu chí:</p>
                      <ul className="list-disc pl-4 text-xs text-zinc-400">
                        {(Array.isArray(task.successCriteria)
                          ? task.successCriteria
                          : task.successCriteria
                          ? [task.successCriteria]
                          : ["Hoàn thành buổi học"]
                        ).map((criteria, idx) => (
                          <li key={`${task.id}-criteria-${idx}`}>{criteria}</li>
                        ))}
                      </ul>
                    </div>
                    {task.milestones && (
                      <div>
                        <p className="text-xs text-zinc-500">Milestones:</p>
                        <ul className="list-disc pl-4 text-xs text-zinc-400">
                          {task.milestones.map((milestone) => (
                            <li key={milestone.id}>
                              {milestone.title} – {milestone.minutesEstimate}p
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
