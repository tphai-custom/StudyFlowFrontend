"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { templates } from "@/src/lib/seed/demoData";
import { saveTask } from "@/src/lib/storage/tasksRepo";
import { getUserProfile } from "@/src/lib/storage/profileRepo";
import { UserProfile } from "@/src/lib/types";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

export default function TemplatesPage() {
  const [status, setStatus] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    (async () => setProfile(await getUserProfile()))();
  }, []);

  const scoreTemplate = (template: typeof templates[number], user: UserProfile) => {
    const subjectMatch = template.tasks.some((task) => user.weakSubjects.includes(task.subject));
    const goalMatch = template.recommendedFor.some((tag) =>
      user.goals.some((goal) => goal.toLowerCase().includes(tag.toLowerCase())),
    );
    return (subjectMatch ? 1 : 0) + (goalMatch ? 1 : 0);
  };

  const recommendedTemplates = useMemo(() => {
    if (!profile) return [];
    return templates
      .map((template) => ({ template, score: scoreTemplate(template, profile) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.template);
  }, [profile]);

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
          durationEstimateMin: task.estimatedMinutes,
          durationEstimateMax: task.estimatedMinutes,
          durationUnit: "minutes",
          importance: 2,
          contentFocus: "Theo template",
          successCriteria: ["Hoàn thành toàn bộ checklist"],
          milestones: [{ title: task.title, minutesEstimate: task.estimatedMinutes }],
        } satisfies TaskFormValues),
      ),
    );
    setStatus(`Đã import template ${template.name}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Template lịch học mẫu</h1>
        <p className="text-sm text-zinc-400">
          Import 1 click để có bộ task + tiêu chí. Hồ sơ học tập giúp chúng tôi gợi ý chính xác hơn.
        </p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>
      {profile && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Gợi ý cho bạn</h2>
            <p className="text-xs text-zinc-500">Dựa trên môn yếu & mục tiêu</p>
          </div>
          {recommendedTemplates.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Chưa có gợi ý. Hãy cập nhật mục tiêu/môn yếu ở Hồ sơ học tập.
            </p>
          ) : (
            <div className="grid-auto">
              {recommendedTemplates.map((template) => (
                <div key={template.id} className="rounded-xl border border-emerald-400/40 bg-emerald-400/5 p-4">
                  <p className="text-xs uppercase text-emerald-300">Ưu tiên</p>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-xs text-zinc-400">{template.forWho}</p>
                  <button
                    className="mt-2 w-full rounded-lg border border-emerald-400/70 px-3 py-2 text-sm text-emerald-200"
                    onClick={() => importTemplate(template.id)}
                  >
                    Dùng ngay
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
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
