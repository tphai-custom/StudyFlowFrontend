"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { taskSchema, TaskFormValues } from "@/src/lib/validation/taskSchema";
import { listTasks, saveTask, deleteTask } from "@/src/lib/storage/tasksRepo";
import { Task } from "@/src/lib/types";
import ConfirmDialog from "@/src/components/ConfirmDialog";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";
import DateInput from "@/src/components/DateInput";

const defaultForm: TaskFormValues = {
  subject: "",
  title: "",
  deadline: "",
  difficulty: 3,
  durationMode: "estimate",
  durationMinutesExact: null,
  durationEstimateMin: 1,
  durationEstimateMax: 2,
  durationUnit: "hours",
  importance: undefined,
  contentFocus: "",
  successCriteria: ["Hoàn thành mục tiêu chính"],
  milestones: [],
  schedulingStyle: "balanced",
};

const exampleTask: TaskFormValues = {
  subject: "Toán",
  title: "Ôn kiểm tra chương 3: Hàm số bậc 2",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  difficulty: 3,
  durationMode: "estimate",
  durationMinutesExact: null,
  durationEstimateMin: 6,
  durationEstimateMax: 8,
  durationUnit: "hours",
  importance: 2,
  contentFocus: "Giải 3 dạng chính: tìm đỉnh, vẽ đồ thị, tìm giao điểm. Note lỗi hay gặp.",
  successCriteria: [
    "Giải đúng 8/10 bài tập mẫu",
    "Nhớ công thức đỉnh và delta",
    "Vẽ được đồ thị chuẩn",
  ],
  milestones: [
    { title: "Ôn lý thuyết và công thức", minutesEstimate: 90 },
    { title: "Làm bài tập 3 dạng", minutesEstimate: 120 },
    { title: "Xem lại lỗi và làm thêm đề", minutesEstimate: 60 },
  ],
  schedulingStyle: "balanced",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formValues, setFormValues] = useState<TaskFormValues>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Filter state
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterSort, setFilterSort] = useState<"deadline" | "difficulty" | "title">("deadline");

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
    setStatus("✓ Đã lưu nhiệm vụ thành công");
    refresh();
  };

  const handleFillExample = () => {
    setFormValues(exampleTask);
    setErrors({});
    setStatus("Đã điền ví dụ. Bạn có thể chỉnh sửa trước khi lưu.");
  };

  // Check for feasibility warnings
  const getFeasibilityWarnings = () => {
    const warnings: string[] = [];
    
    // Convert estimate to minutes for comparison
    const estimateMinutes =
      formValues.durationUnit === "hours"
        ? formValues.durationEstimateMax * 60
        : formValues.durationEstimateMax;
    
    if (estimateMinutes > 480) {
      warnings.push(
        "⚠️ Ước lượng khá lớn (>8 giờ). Cân nhắc chia nhỏ thành nhiều task hoặc dùng milestones."
      );
    }

    if (formValues.deadline) {
      const deadlineDate = new Date(formValues.deadline);
      const hoursUntilDeadline = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDeadline < 48) {
        warnings.push(
          "⚠️ Deadline rất gần (<2 ngày)! Đảm bảo có đủ slot rảnh để hoàn thành."
        );
      }
    }

    return warnings;
  };

  const feasibilityWarnings = getFeasibilityWarnings();

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

  // Filtered + sorted task list
  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (filterSubject) list = list.filter((t) => t.subject?.toLowerCase() === filterSubject.toLowerCase());
    if (filterSearch) list = list.filter((t) => t.title.toLowerCase().includes(filterSearch.toLowerCase()) || t.subject?.toLowerCase().includes(filterSearch.toLowerCase()));
    if (filterStatus === "done") list = list.filter((t) => {
      const doneMin = t.doneMinutes ?? t.progressMinutes ?? 0;
      const plannedMin = t.plannedMinutes ?? t.estimatedMinutes ?? 1;
      return t.progressPercent === 100 || (doneMin >= plannedMin);
    });
    else if (filterStatus === "active") list = list.filter((t) => {
      const doneMin = t.doneMinutes ?? t.progressMinutes ?? 0;
      const plannedMin = t.plannedMinutes ?? t.estimatedMinutes ?? 1;
      return (t.progressPercent ?? 0) < 100 && doneMin < plannedMin;
    });
    else if (filterStatus === "overdue") list = list.filter((t) => {
      const pct = t.progressPercent ?? Math.min(100, Math.round(((t.progressMinutes ?? 0) / (t.estimatedMinutes ?? 1)) * 100));
      return new Date(t.deadline) < new Date() && pct < 100;
    });
    list.sort((a, b) => {
      // Parent+locked tasks always first
      const aTopPriority = (a.source === "parent" || a.locked || a.lockedByParent) ? 0 : 1;
      const bTopPriority = (b.source === "parent" || b.locked || b.lockedByParent) ? 0 : 1;
      if (aTopPriority !== bTopPriority) return aTopPriority - bTopPriority;
      if (filterSort === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (filterSort === "difficulty") return (b.difficulty ?? 0) - (a.difficulty ?? 0);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [tasks, filterSubject, filterSearch, filterStatus, filterSort]);

  const uniqueSubjects = useMemo(() => [...new Set(tasks.map((t) => t.subject).filter(Boolean))], [tasks]);



  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title="Nhiệm vụ học tập"
        description="Nhập nhiệm vụ với deadline, độ khó và tiêu chí thành công."
        actions={
          <button
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "× Đóng form" : "+ Nhiệm vụ mới"}
          </button>
        }
      />
      {showForm && (
      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tạo nhiệm vụ mới</h2>
          <button
            type="button"
            onClick={handleFillExample}
            className="rounded-lg border border-emerald-500/50 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10"
          >
            💡 Điền thử bằng ví dụ
          </button>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-xs text-sky-200">
            💡 <strong>Mẹo:</strong> Nhấn Tab để chuyển trường nhanh, Enter để thêm tiêu chí mới
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Môn học*</label>
            <input
              id="subject"
              name="subject"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Ví dụ: Toán, Vật lý, Tiếng Anh"
            />
            {errors.subject && <p className="text-sm text-red-400">{errors.subject}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Tên nhiệm vụ*</label>
            <input
              id="title"
              name="title"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ví dụ: Ôn kiểm tra chương 3, Làm bài tập tuần 5"
            />
            {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Deadline*</label>
            <div className="flex gap-2">
              <DateInput
                id="deadline-date"
                name="deadline-date"
                wrapperClassName="flex-1"
                className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
                value={formValues.deadline ? formValues.deadline.slice(0, 10) : ""}
                onChange={(iso) => {
                  const time = formValues.deadline ? formValues.deadline.slice(11, 16) : "23:59";
                  handleChange("deadline", iso ? `${iso}T${time}` : "");
                }}
              />
              <input
                id="deadline-time"
                name="deadline-time"
                type="time"
                disabled={!formValues.deadline || !formValues.deadline.slice(0, 10)}
                className="w-36 rounded-lg border border-zinc-700 bg-transparent p-2 disabled:cursor-not-allowed disabled:opacity-40"
                value={formValues.deadline ? formValues.deadline.slice(11, 16) : "23:59"}
                onChange={(e) => {
                  const date = formValues.deadline ? formValues.deadline.slice(0, 10) : "";
                  handleChange("deadline", date ? `${date}T${e.target.value}` : "");
                }}
              />
            </div>
            {errors.deadline ? (
              <p className="text-sm text-red-400">{errors.deadline}</p>
            ) : (
              <p className="text-xs text-zinc-500">Không nhận deadline quá khứ. Nếu quên giờ sẽ tự đặt 23:59.</p>
            )}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Độ khó (1-5)*</label>
            <input
              id="difficulty"
              name="difficulty"
              type="number"
              min={1}
              max={5}
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={formValues.difficulty}
              onChange={(e) => handleChange("difficulty", Number(e.target.value))}
            />
            {errors.difficulty && <p className="text-sm text-red-400">{errors.difficulty}</p>}
          </div>
          {/* P1: Duration Mode */}
          <div className="grid gap-2">
            <label className="text-sm text-zinc-300">Thời lượng học*</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="durationMode"
                  value="estimate"
                  checked={formValues.durationMode !== "exact"}
                  onChange={() => handleChange("durationMode", "estimate")}
                  className="accent-emerald-400"
                />
                <span className="text-sm">⚖️ Ước lượng (khoảng từ–đến)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="durationMode"
                  value="exact"
                  checked={formValues.durationMode === "exact"}
                  onChange={() => handleChange("durationMode", "exact")}
                  className="accent-emerald-400"
                />
                <span className="text-sm">🎯 Chính xác</span>
              </label>
            </div>
            {formValues.durationMode === "exact" ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="durationMinutesExact"
                  name="durationMinutesExact"
                  type="number"
                  min={1}
                  className="w-28 rounded-lg border border-zinc-700 bg-transparent p-2"
                  value={formValues.durationMinutesExact ?? ""}
                  onChange={(e) => handleChange("durationMinutesExact", e.target.value === "" ? undefined : Number(e.target.value))}
                  placeholder="Phút"
                />
                <span className="text-sm text-zinc-500">phút</span>
                {errors.durationMinutesExact && (
                  <p className="w-full text-sm text-red-400">{errors.durationMinutesExact}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input
                  id="durationEstimateMin"
                  name="durationEstimateMin"
                  type="number"
                  min={1}
                  className="w-24 rounded-lg border border-zinc-700 bg-transparent p-2"
                  value={formValues.durationEstimateMin}
                  onChange={(e) => handleChange("durationEstimateMin", Number(e.target.value))}
                />
                <span className="self-center text-sm text-zinc-500">–</span>
                <input
                  id="durationEstimateMax"
                  name="durationEstimateMax"
                  type="number"
                  min={1}
                  className="w-24 rounded-lg border border-zinc-700 bg-transparent p-2"
                  value={formValues.durationEstimateMax}
                  onChange={(e) => handleChange("durationEstimateMax", Number(e.target.value))}
                />
                <select
                  id="durationUnit"
                  name="durationUnit"
                  className="rounded-lg border border-zinc-700 bg-transparent p-2"
                  value={formValues.durationUnit}
                  onChange={(e) => handleChange("durationUnit", e.target.value as TaskFormValues["durationUnit"])}
                >
                  <option value="hours">Giờ</option>
                  <option value="minutes">Phút</option>
                </select>
                {errors.durationEstimateMin && (
                  <p className="w-full text-sm text-red-400">{errors.durationEstimateMin}</p>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-500">
              {formValues.durationMode === "exact"
                ? "Planner dùng đúng số phút này để chia lịch."
                : "Planner dùng trung bình (min+max)/2 để chia lịch."}
            </p>
          </div>

          {/* P1: Scheduling Style */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Phong cách chia lịch</label>
            <select
              id="schedulingStyle"
              name="schedulingStyle"
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2"
              value={formValues.schedulingStyle ?? "balanced"}
              onChange={(e) => handleChange("schedulingStyle", e.target.value as TaskFormValues["schedulingStyle"])}
            >
              <option value="front-load">🚀 Hoàn thành sớm (Front-load)</option>
              <option value="balanced">⚖️ Rải đều (Balanced)</option>
              <option value="deadline-loaded">⏰ Gần deadline (Deadline-loaded)</option>
            </select>
            <p className="text-xs text-zinc-500">Xác định phiên học được ưu tiên rải sớm hay gần deadline.</p>
          </div>

          {/* Feasibility Warnings */}
          {feasibilityWarnings.length > 0 && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 space-y-1">
              {feasibilityWarnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-200">
                  {warning}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Mức quan trọng (1-3)</label>
            <input
              id="importance"
              name="importance"
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
              id="contentFocus"
              name="contentFocus"
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
                    id={`successCriteria-${index}`}
                    name={`successCriteria-${index}`}
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
                      id={`milestone-title-${index}`}
                      name={`milestone-title-${index}`}
                      className="rounded-lg border border-zinc-700 bg-transparent p-2"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                      placeholder="Tên mốc ví dụ Ôn công thức"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        id={`milestone-minutes-${index}`}
                        name={`milestone-minutes-${index}`}
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
      )}
      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Danh sách nhiệm vụ</h2>
          <span className="text-xs text-zinc-500">{filteredTasks.length}/{tasks.length} nhiệm vụ</span>
        </div>
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          <input
            id="filterSearch"
            name="filterSearch"
            className="min-w-[160px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm"
            placeholder="Tìm kiếm…"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
          <select
            id="filterSubject"
            name="filterSubject"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Tất cả môn</option>
            {uniqueSubjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            id="filterStatus"
            name="filterStatus"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Chưa xong</option>
            <option value="done">Đã xong</option>
            <option value="overdue">Quá hạn</option>
          </select>
          <select
            id="filterSort"
            name="filterSort"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value as "deadline" | "difficulty" | "title")}
          >
            <option value="deadline">Sắp xếp: Deadline</option>
            <option value="difficulty">Sắp xếp: Độ khó</option>
            <option value="title">Sắp xếp: Tên</option>
          </select>
        </div>
        {tasks.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Chưa có nhiệm vụ nào"
            description="Tạo nhiệm vụ đầu tiên để bắt đầu lập kế hoạch học tập."
            primaryCTA={{ label: "+ Tạo ngay", href: "#" }}
          />
        ) : filteredTasks.length === 0 ? (
          <p className="text-sm text-zinc-400">Không có nhiệm vụ nào khớp bộ lọc.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTasks.map((task) => {
              const doneMin = task.doneMinutes ?? task.progressMinutes ?? 0;
              const plannedMin = task.plannedMinutes ?? task.estimatedMinutes ?? 1;
              const pct = task.progressPercent ?? Math.min(100, Math.round((doneMin / plannedMin) * 100));
              const isOverdue = new Date(task.deadline) < new Date() && pct < 100;
              const doneSess = task.sessionsDone ?? 0;
              const totalSess = task.totalSessions ?? 0;
              return (
              <li key={task.id} className="rounded-lg border border-zinc-700/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">{task.subject}</span>
                      {isOverdue && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">⚠️ Quá hạn</span>}
                      {pct >= 100 && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-300">✓ Xong</span>}
                      {task.source === "parent" && (
                        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-300">👨‍👩‍👧 Từ phụ huynh</span>
                      )}
                      {(task.lockedByParent || task.locked) && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">🔒 Bắt buộc</span>}
                    </div>
                    <Link href={`/tasks/${task.id}`} className="text-base font-semibold text-zinc-100 hover:text-emerald-300 transition-colors">
                      {task.title}
                    </Link>
                    <p className="text-xs text-zinc-400">
                      Hạn: {new Date(task.deadline).toLocaleString("vi-VN")} · Độ khó: {task.difficulty}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 shrink-0 min-w-[90px] text-right">
                        {doneMin}/{plannedMin} phút · {pct}%
                      </span>
                    </div>
                    {totalSess > 0 && (
                      <p className="text-xs text-zinc-500">{doneSess}/{totalSess} phiên xong</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                      Chi tiết
                    </Link>
                    <button
                      className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300"
                      onClick={() => setPendingDeleteId(task.id)}
                      style={{ display: task.childCanDelete === false ? "none" : undefined }}
                    >
                      Xoá
                    </button>
                  </div>
                </div>

              </li>
              );
            })}
          </ul>
        )}
      </section>
      {pendingDeleteId && (
        <ConfirmDialog
          message="Bạn có chắc muốn xóa nhiệm vụ này?"
          onConfirm={() => {
            deleteTask(pendingDeleteId).then(refresh);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
