"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { templates } from "@/src/lib/seed/demoData";
import { saveTask } from "@/src/lib/storage/tasksRepo";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

export default function TemplatesPage() {
  const [status, setStatus] = useState<string>("");

  const importTemplate = async (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    const deadline = addDays(new Date(), template.durationDays).toISOString();
    await Promise.all(
      template.tasks.map((task) =>
        saveTask({
          subject: task.subject,
          title: `${template.name} · ${task.title}`,
          deadline,
          difficulty: task.difficulty,
          estimatedMinutes: task.estimatedMinutes,
          importance: 2,
          contentFocus: "Theo template",
          successCriteria: "Hoàn thành toàn bộ checklist",
        } satisfies TaskFormValues),
      ),
    );
    setStatus(`Đã import template ${template.name}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Template lịch học mẫu</h1>
        <p className="text-sm text-zinc-400">Import 1 click để có bộ task + tiêu chí.</p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>
      <section className="grid-auto">
        {templates.map((template) => (
          <div key={template.id} className="card space-y-2">
            <p className="text-xs text-zinc-500 uppercase">{template.durationDays} ngày</p>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-sm text-zinc-400">{template.recommendedMinutesPerDay} phút/ngày</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
              {template.tasks.map((task) => (
                <li key={task.title}>
                  {task.subject}: {task.title} ({task.estimatedMinutes} phút)
                </li>
              ))}
            </ul>
            <button
              className="w-full rounded-xl border border-emerald-400 px-4 py-2 text-sm text-emerald-200"
              onClick={() => importTemplate(template.id)}
            >
              Import template
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
