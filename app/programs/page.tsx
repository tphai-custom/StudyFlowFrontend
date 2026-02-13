"use client";

import { useState, useMemo } from "react";
import { addDays } from "date-fns";
import { programs } from "@/src/lib/seed/demoData";
import { saveTask } from "@/src/lib/storage/tasksRepo";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

const CATEGORIES = [
  { value: "", label: "Tất cả" },
  { value: "tăng-điểm", label: "Tăng điểm môn cụ thể" },
  { value: "ôn-thi", label: "Ôn thi theo mốc thời gian" },
  { value: "kỹ-năng", label: "Kỹ năng: đọc hiểu, viết, ghi nhớ" },
  { value: "stem", label: "STEM: luyện bài tập và dự án" },
];

export default function ProgramsPage() {
  const [status, setStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const importProgram = async (programId: string) => {
    const program = programs.find((item) => item.id === programId);
    if (!program) return;
    const promises: Promise<unknown>[] = [];
    program.milestones.forEach((milestone, index) => {
      const deadline = addDays(new Date(), (index + 1) * 7).toISOString();
      milestone.suggestedTasks.forEach((task) => {
        promises.push(
          saveTask({
            subject: task.subject,
            title: `${program.name} · ${milestone.title}`,
            deadline,
            difficulty: task.difficulty,
            durationEstimateMin: task.estimatedMinutes,
            durationEstimateMax: task.estimatedMinutes,
            durationUnit: "minutes",
            importance: 3,
            contentFocus: milestone.title,
            successCriteria: [milestone.successCriteria],
            milestones: [{ title: milestone.title, minutesEstimate: task.estimatedMinutes }],
          } satisfies TaskFormValues),
        );
      });
    });
    await Promise.all(promises);
    setStatus(`✅ Đã import program ${program.name}`);
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesCategory = !selectedCategory || program.target === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.target.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Chương trình học (Programs)</h1>
        <p className="text-sm text-zinc-400">
          Chương trình có cấu trúc với milestones rõ ràng - học gì, đạt gì.
        </p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>

      {/* Search and Filter */}
      <section className="card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm chương trình..."
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Danh mục</label>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <div className="card text-center">
            <p className="text-zinc-400 mb-3">
              Không tìm thấy chương trình phù hợp. Hãy thử từ khóa khác hoặc chọn danh mục khác.
            </p>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div key={program.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">{program.target}</p>
                  <h2 className="text-xl font-semibold">{program.name}</h2>
                </div>
                <button
                  className="rounded-xl border border-emerald-400 px-4 py-2 text-sm text-emerald-200"
                  onClick={() => importProgram(program.id)}
                >
                  Import program
                </button>
              </div>
              <ul className="space-y-2">
                {program.milestones.map((milestone) => (
                  <li key={milestone.id} className="rounded-lg border border-zinc-700/60 p-3">
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="text-xs text-zinc-400">Tiêu chí: {milestone.successCriteria}</p>
                    <p className="text-xs text-zinc-500">
                      Task gợi ý: {milestone.suggestedTasks.map((task) => `${task.subject}-${task.title}`).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
