"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { programs } from "@/src/lib/seed/demoData";
import { saveTask } from "@/src/lib/storage/tasksRepo";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

export default function ProgramsPage() {
  const [status, setStatus] = useState<string>("");

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
    setStatus(`Đã import program ${program.name}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Program theo mục tiêu</h1>
        <p className="text-sm text-zinc-400">Có milestones rõ ràng “học gì – đạt gì”.</p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>
      <section className="space-y-4">
        {programs.map((program) => (
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
        ))}
      </section>
    </div>
  );
}
