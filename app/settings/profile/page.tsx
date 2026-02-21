"use client";

import { FormEvent, useEffect, useState } from "react";
import { getUserProfile, saveUserProfile } from "@/src/lib/storage/profileRepo";
import { EnergyLevel, UserProfile } from "@/src/lib/types";
import { getUser } from "@/src/lib/auth";

const BREAK_PRESETS = [
  { value: "Pomodoro 25/5", label: "Pomodoro 25/5 (học 25p – nghỉ 5p)" },
  { value: "Pomodoro 50/10", label: "Pomodoro 50/10 (học 50p – nghỉ 10p)" },
  { value: "Deep work 90/20", label: "Deep work 90/20 (học 90p – nghỉ 20p)" },
  { value: "custom", label: "Tuỳ chỉnh…" },
];

const GRADE_OPTIONS = [
  { value: "Lớp 6", label: "Lớp 6" },
  { value: "Lớp 7", label: "Lớp 7" },
  { value: "Lớp 8", label: "Lớp 8" },
  { value: "Lớp 9", label: "Lớp 9" },
  { value: "Lớp 10", label: "Lớp 10" },
  { value: "Lớp 11", label: "Lớp 11" },
  { value: "Lớp 12", label: "Lớp 12" },
  { value: "Ôn thi đại học", label: "Ôn thi đại học" },
  { value: "Khác", label: "Khác" },
];

const SUBJECT_LIST = ["Toán", "Văn", "Anh", "Lý", "Hoá", "Sinh", "Sử", "Địa", "GDCD", "Tin học", "Tiếng Nhật", "Tiếng Pháp"];

const TIMEZONE_LIST = [
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

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

function SubjectChips({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (subjects: string[]) => void;
}) {
  const toggle = (subject: string) => {
    onChange(selected.includes(subject) ? selected.filter((s) => s !== subject) : [...selected, subject]);
  };
  return (
    <div className="grid gap-1">
      <label className="text-sm text-zinc-400">{label}</label>
      <div className="flex flex-wrap gap-2">
        {SUBJECT_LIST.map((subject) => (
          <button
            key={subject}
            type="button"
            onClick={() => toggle(subject)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              selected.includes(subject)
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<string>("");
  const [tzSearch, setTzSearch] = useState("");
  const [form, setForm] = useState({
    gradeLevel: "",
    goals: "",
    weakSubjects: [] as string[],
    strongSubjects: [] as string[],
    learningPace: "balanced",
    energyMorning: "medium" as EnergyLevel,
    energyAfternoon: "medium" as EnergyLevel,
    energyEvening: "medium" as EnergyLevel,
    dailyLimitPreference: 180,
    favoriteBreakPreset: "Pomodoro 50/10",
    customFocus: 50,
    customRest: 10,
    timezone: "Asia/Ho_Chi_Minh",
  });

  useEffect(() => {
    (async () => {
      const existing = await getUserProfile();
      setProfile(existing);
      const isCustom = !BREAK_PRESETS.slice(0, 3).some((p) => p.value === existing.favoriteBreakPreset);
      const customMatch = isCustom ? existing.favoriteBreakPreset.match(/Custom (\d+)\/(\d+)/) : null;
      setForm({
        gradeLevel: existing.gradeLevel,
        goals: existing.goals.join("\n"),
        weakSubjects: existing.weakSubjects,
        strongSubjects: existing.strongSubjects,
        learningPace: existing.learningPace,
        energyMorning: existing.energyPreferences.morning,
        energyAfternoon: existing.energyPreferences.afternoon,
        energyEvening: existing.energyPreferences.evening,
        dailyLimitPreference: existing.dailyLimitPreference,
        favoriteBreakPreset: isCustom ? "custom" : existing.favoriteBreakPreset,
        customFocus: customMatch ? Number(customMatch[1]) : 50,
        customRest: customMatch ? Number(customMatch[2]) : 10,
        timezone: existing.timezone,
      });
      setTzSearch(existing.timezone);
    })();
  }, []);

  const handleChange = (field: keyof typeof form, value: string | number | EnergyLevel | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resolvedPreset =
    form.favoriteBreakPreset === "custom"
      ? `Custom ${form.customFocus}/${form.customRest}`
      : form.favoriteBreakPreset;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    const payload = {
      id: profile.id,
      gradeLevel: form.gradeLevel,
      goals: form.goals
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      weakSubjects: form.weakSubjects,
      strongSubjects: form.strongSubjects,
      learningPace: form.learningPace as UserProfile["learningPace"],
      energyPreferences: {
        morning: form.energyMorning,
        afternoon: form.energyAfternoon,
        evening: form.energyEvening,
      },
      dailyLimitPreference: Number(form.dailyLimitPreference),
      favoriteBreakPreset: resolvedPreset,
      timezone: form.timezone,
    } satisfies Omit<UserProfile, "updatedAt">;
    const saved = await saveUserProfile(payload);
    setProfile(saved);
    setStatus("✓ Đã lưu hồ sơ học tập. Planner sẽ cá nhân hoá đề xuất.");
  };

  const filteredTz = TIMEZONE_LIST.filter((tz) => tz.toLowerCase().includes(tzSearch.toLowerCase()));

  if (!profile) {
    return <p className="text-sm text-zinc-400">Đang tải hồ sơ...</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Hồ sơ học tập</h1>
        <p className="text-sm text-zinc-400">
          Thiết lập đúng giúp Planner xếp lịch thông minh hơn và Templates gợi ý chính xác hơn.
        </p>
        {status && <p className="text-xs text-emerald-400 mt-1">{status}</p>}
      </header>

      {/* Student link code display */}
      {(() => {
        const u = getUser();
        if (u?.role === "student" && u?.link_code) {
          return (
            <div className="card flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Mã liên kết phụ huynh</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chia sẻ mã này với phụ huynh để họ có thể liên kết tài khoản.
                </p>
              </div>
              <span className="rounded-xl bg-emerald-500/15 px-4 py-2 font-mono text-lg font-bold tracking-widest text-emerald-300">
                {u.link_code}
              </span>
            </div>
          );
        }
        return null;
      })()}

      <section className="card">
        <form className="grid gap-5" onSubmit={handleSubmit}>

          {/* Grade level — dropdown */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Lớp / Cấp độ học</label>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
              value={form.gradeLevel}
              onChange={(e) => handleChange("gradeLevel", e.target.value)}
            >
              <option value="">— Chọn lớp —</option>
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Goals */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Mục tiêu (mỗi dòng một mục tiêu)</label>
            <textarea
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={form.goals}
              onChange={(e) => handleChange("goals", e.target.value)}
              rows={3}
              placeholder="Ví dụ: Lên band 7.0&#10;Hoàn thành đề toán mỗi tuần"
            />
          </div>

          {/* Weak subjects — chips */}
          <SubjectChips
            label="Môn yếu (chọn nhiều)"
            selected={form.weakSubjects}
            onChange={(v) => handleChange("weakSubjects", v)}
          />

          {/* Strong subjects — chips */}
          <SubjectChips
            label="Môn mạnh (chọn nhiều)"
            selected={form.strongSubjects}
            onChange={(v) => handleChange("strongSubjects", v)}
          />

          {/* Learning pace */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Tốc độ học</label>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
              value={form.learningPace}
              onChange={(e) => handleChange("learningPace", e.target.value)}
            >
              {paceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Energy preferences */}
          <div className="grid gap-2 sm:grid-cols-3">
            {(["energyMorning", "energyAfternoon", "energyEvening"] as const).map((field) => (
              <div key={field} className="grid gap-1">
                <label className="text-sm text-zinc-400">
                  {field === "energyMorning" ? "Sáng" : field === "energyAfternoon" ? "Chiều" : "Tối"}
                </label>
                <select
                  className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value as EnergyLevel)}
                >
                  {energyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Daily limit */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Giới hạn phút học/ngày mong muốn</label>
            <input
              type="number"
              min={60}
              max={600}
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={form.dailyLimitPreference}
              onChange={(e) => handleChange("dailyLimitPreference", Number(e.target.value))}
            />
          </div>

          {/* Break preset — select */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Preset nghỉ ưa thích</label>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
              value={form.favoriteBreakPreset}
              onChange={(e) => handleChange("favoriteBreakPreset", e.target.value)}
            >
              {BREAK_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {form.favoriteBreakPreset === "custom" && (
              <div className="mt-2 flex gap-3">
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  Học (phút)
                  <input
                    type="number"
                    min={10}
                    max={180}
                    className="w-20 rounded border border-zinc-700 bg-transparent px-2 py-1 text-sm"
                    value={form.customFocus}
                    onChange={(e) => handleChange("customFocus", Number(e.target.value))}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  Nghỉ (phút)
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className="w-20 rounded border border-zinc-700 bg-transparent px-2 py-1 text-sm"
                    value={form.customRest}
                    onChange={(e) => handleChange("customRest", Number(e.target.value))}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Timezone — combobox with search */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Múi giờ (Timezone)</label>
            <input
              type="text"
              placeholder="Tìm timezone… (vd: Ho_Chi_Minh, Tokyo)"
              className="rounded-t-lg border border-b-0 border-zinc-700 bg-transparent p-2 text-sm"
              value={tzSearch}
              onChange={(e) => setTzSearch(e.target.value)}
            />
            <select
              size={4}
              className="rounded-b-lg border border-zinc-700 bg-zinc-900 p-1 text-sm"
              value={form.timezone}
              onChange={(e) => {
                handleChange("timezone", e.target.value);
                setTzSearch(e.target.value);
              }}
            >
              {filteredTz.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">Hiện tại: <code>{form.timezone}</code></p>
          </div>

          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu hồ sơ
          </button>
        </form>
      </section>
    </div>
  );
}
