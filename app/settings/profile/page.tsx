"use client";

import { FormEvent, useEffect, useState } from "react";
import { getUserProfile, saveUserProfile } from "@/src/lib/storage/profileRepo";
import { EnergyLevel, UserProfile } from "@/src/lib/types";

const paceOptions = [
  { value: "slow", label: "Chậm" },
  { value: "balanced", label: "Vừa phải" },
  { value: "fast", label: "Nhanh" },
];

const energyOptions: { value: EnergyLevel; label: string }[] = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Vừa" },
  { value: "high", label: "Cao" },
];

const splitLines = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<string>("");
  const [form, setForm] = useState({
    gradeLevel: "",
    goals: "",
    weakSubjects: "",
    strongSubjects: "",
    learningPace: "balanced",
    energyMorning: "medium" as EnergyLevel,
    energyAfternoon: "medium" as EnergyLevel,
    energyEvening: "medium" as EnergyLevel,
    dailyLimitPreference: 180,
    favoriteBreakPreset: "Pomodoro 50/10",
    timezone: Intl?.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Ho_Chi_Minh",
  });

  useEffect(() => {
    (async () => {
      const existing = await getUserProfile();
      setProfile(existing);
      setForm({
        gradeLevel: existing.gradeLevel,
        goals: existing.goals.join("\n"),
        weakSubjects: existing.weakSubjects.join(", "),
        strongSubjects: existing.strongSubjects.join(", "),
        learningPace: existing.learningPace,
        energyMorning: existing.energyPreferences.morning,
        energyAfternoon: existing.energyPreferences.afternoon,
        energyEvening: existing.energyPreferences.evening,
        dailyLimitPreference: existing.dailyLimitPreference,
        favoriteBreakPreset: existing.favoriteBreakPreset,
        timezone: existing.timezone,
      });
    })();
  }, []);

  const handleChange = (field: keyof typeof form, value: string | number | EnergyLevel) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    const payload = {
      id: profile.id,
      gradeLevel: form.gradeLevel,
      goals: splitLines(form.goals),
      weakSubjects: splitLines(form.weakSubjects),
      strongSubjects: splitLines(form.strongSubjects),
      learningPace: form.learningPace as UserProfile["learningPace"],
      energyPreferences: {
        morning: form.energyMorning,
        afternoon: form.energyAfternoon,
        evening: form.energyEvening,
      },
      dailyLimitPreference: Number(form.dailyLimitPreference),
      favoriteBreakPreset: form.favoriteBreakPreset,
      timezone: form.timezone,
    } satisfies Omit<UserProfile, "updatedAt">;
    const saved = await saveUserProfile(payload);
    setProfile(saved);
    setStatus("Đã lưu hồ sơ học tập. Planner sẽ cá nhân hoá đề xuất.");
  };

  if (!profile) {
    return <p className="text-sm text-zinc-400">Đang tải hồ sơ...</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Hồ sơ học tập</h1>
        <p className="text-sm text-zinc-400">
          Nhập đúng thời gian rảnh và mục tiêu để Templates/Programs gợi ý chính xác hơn. Ước lượng càng chuẩn thì lịch càng hợp lý.
        </p>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
      </header>
      <section className="card">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Lớp hiện tại</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.gradeLevel}
              onChange={(e) => handleChange("gradeLevel", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Mục tiêu (mỗi dòng một mục tiêu)</label>
            <textarea
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.goals}
              onChange={(e) => handleChange("goals", e.target.value)}
              rows={3}
              placeholder="Ví dụ: Lên band 7.0\nHoàn thành đề toán mỗi tuần"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Môn yếu (cách nhau bởi dấu phẩy)</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.weakSubjects}
              onChange={(e) => handleChange("weakSubjects", e.target.value)}
              placeholder="Toán, Hoá, Tiếng Anh"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Môn mạnh</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.strongSubjects}
              onChange={(e) => handleChange("strongSubjects", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Tốc độ học</label>
            <select
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.learningPace}
              onChange={(e) => handleChange("learningPace", e.target.value)}
            >
              {paceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["energyMorning", "energyAfternoon", "energyEvening"] as const).map((field) => (
              <div key={field} className="grid gap-1">
                <label className="text-sm text-zinc-400">
                  {field === "energyMorning" ? "Năng lượng buổi sáng" : field === "energyAfternoon" ? "Buổi chiều" : "Buổi tối"}
                </label>
                <select
                  className="rounded-lg border border-zinc-700 bg-transparent p-2"
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value as EnergyLevel)}
                >
                  {energyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Giới hạn phút mỗi ngày mong muốn</label>
            <input
              type="number"
              min={60}
              max={600}
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.dailyLimitPreference}
              onChange={(e) => handleChange("dailyLimitPreference", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Preset nghỉ ưa thích</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.favoriteBreakPreset}
              onChange={(e) => handleChange("favoriteBreakPreset", e.target.value)}
              placeholder="Ví dụ: Deep work 50/10"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Timezone</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
            />
          </div>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu hồ sơ
          </button>
        </form>
      </section>
    </div>
  );
}
