"use client";

import { FormEvent, useEffect, useState } from "react";
import { getUserProfile, saveUserProfile } from "@/src/lib/storage/profileRepo";
import { EnergyLevel, UserProfile } from "@/src/lib/types";
import { getUser, saveAuth, getToken, AuthUser } from "@/src/lib/auth";
import { authRotateLinkCode } from "@/src/lib/api/auth";
import { studentIncomingLinks, studentRespondLink, LinkSchema } from "@/src/lib/api/parent";
import { studentGetLockedFields } from "@/src/lib/api/parent";
import { getEffectiveSettings, EffectiveSettingsResult } from "@/src/lib/api/settings";
import { apiFetch } from "@/src/lib/api/client";

// ---- Parent Profile Component ----
// Parents only need a simple personal info form, not the full learning profile.
function ParentProfileSection({ currentUser }: { currentUser: AuthUser }) {
  const [form, setForm] = useState({
    last_name: currentUser.last_name ?? "",
    first_name: currentUser.first_name ?? "",
    address: currentUser.address ?? "",
    bio: currentUser.bio ?? "",
  });
  const [status, setStatus] = useState("");

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setStatus("✓ Đã lưu thông tin cá nhân.");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("✗ Không thể lưu. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>
        <p className="text-sm text-zinc-400">
          Thông tin cơ bản của tài khoản phụ huynh.
        </p>
        {status && (
          <p className={`text-xs mt-1 ${status.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
            {status}
          </p>
        )}
      </header>

      <section className="card">
        <form className="grid gap-5" onSubmit={handleSave}>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-1">
              <label className="text-sm text-zinc-400">Họ</label>
              <input
                type="text"
                className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                value={form.last_name}
                onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm text-zinc-400">Tên</label>
              <input
                type="text"
                className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                value={form.first_name}
                onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Địa chỉ</label>
            <input
              type="text"
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Địa chỉ liên hệ (tuỳ chọn)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">Ghi chú cá nhân</label>
            <textarea
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Mô tả ngắn về bạn (tuỳ chọn)"
            />
          </div>

          <div className="rounded-lg bg-zinc-800/50 px-4 py-3 text-xs text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-300">Thông tin tài khoản</p>
            <p>Tên đăng nhập: <span className="text-zinc-200 font-mono">{currentUser.username}</span></p>
            <p>Vai trò: <span className="text-zinc-200">Phụ huynh</span></p>
            <p className="text-zinc-500">Để thay đổi mật khẩu, liên hệ quản trị viên.</p>
          </div>

          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu thông tin
          </button>
        </form>
      </section>
    </div>
  );
}

const BREAK_PRESETS = [
  { value: "Pomodoro 25/5", label: "Pomodoro 25/5 (học 25p – nghỉ 5p)" },
  { value: "Pomodoro 50/10", label: "Pomodoro 50/10 (học 50p – nghỉ 10p)" },
  { value: "Deep work 90/20", label: "Deep work 90/20 (học 90p – nghỉ 20p)" },
  { value: "custom", label: "Tuỳ chỉnh…" },
];

const GRADE_OPTIONS = [
  { value: "Lớp 1", label: "Lớp 1" },
  { value: "Lớp 2", label: "Lớp 2" },
  { value: "Lớp 3", label: "Lớp 3" },
  { value: "Lớp 4", label: "Lớp 4" },
  { value: "Lớp 5", label: "Lớp 5" },
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

// GMT offsets from -12 to +14
const GMT_OFFSETS: { value: number; label: string }[] = (() => {
  const list = [];
  const NAMED: Record<number, string> = {
    420: " (Việt Nam / Bangkok)",
    480: " (Singapore / Bắc Kinh)",
    540: " (Tokyo / Seoul)",
    330: " (Ấn Độ)",
    0: " (UTC)",
    60: " (Paris / Berlin mùa hè)",
    "-300": " (New York)",
    "-480": " (Los Angeles)",
  };
  for (let h = -12; h <= 14; h++) {
    const mins = h * 60;
    const sign = h >= 0 ? "+" : "";
    const note = NAMED[mins] ?? "";
    list.push({ value: mins, label: `GMT${sign}${h}${note}` });
  }
  return list;
})();

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [rotateLoading, setRotateLoading] = useState(false);
  const [incomingLinks, setIncomingLinks] = useState<LinkSchema[]>([]);
  const [lockedFields, setLockedFields] = useState<string[]>([]);
  const [effective, setEffective] = useState<EffectiveSettingsResult | null>(null);
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
    tzOffsetMinutes: 420,
  });

  useEffect(() => {
    const u = getUser();
    setCurrentUser(u);
    if (u?.role === "student") {
      studentIncomingLinks().then(setIncomingLinks).catch(() => {});
      studentGetLockedFields().then(setLockedFields).catch(() => {});
      getEffectiveSettings().then(setEffective).catch(() => {});
    }
    // Parents don't have a learning profile — skip loading it
    if (u?.role === "parent") return;
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
        tzOffsetMinutes: existing.tzOffsetMinutes ?? 420,
      });
      // timezone offset already set above
    })().catch(() => {});
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
      tzOffsetMinutes: Number(form.tzOffsetMinutes),
    } satisfies Omit<UserProfile, "updatedAt">;
    const saved = await saveUserProfile(payload);
    setProfile(saved);
    setStatus("✓ Đã lưu hồ sơ học tập. Planner sẽ cá nhân hoá đề xuất.");
  };



  if (!profile && currentUser?.role !== "parent") {
    return <p className="text-sm text-zinc-400">Đang tải hồ sơ...</p>;
  }

  const isLocked = (fieldKey: string) => lockedFields.includes(fieldKey);

  // --- Parent profile: simple personal info form ---
  if (currentUser?.role === "parent") {
    return <ParentProfileSection currentUser={currentUser!} />;
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

      {/* Locked fields banner */}
      {lockedFields.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <p className="text-xs text-yellow-300">
            🔒 Phụ huynh đã khoá {lockedFields.length} trường cài đặt. Các trường bị khoá không thể chỉnh sửa.
          </p>
        </div>
      )}

      {/* Student link code display */}
      {currentUser?.role === "student" && (
        <div className="card space-y-4">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Mã liên kết phụ huynh</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Chia sẻ mã này với phụ huynh để họ liên kết tài khoản theo dõi tiến độ của bạn.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-500/15 px-4 py-2 font-mono text-lg font-bold tracking-widest text-emerald-300">
              {currentUser.link_code ?? "—"}
            </span>
            <button
              type="button"
              onClick={() => {
                if (currentUser.link_code) {
                  navigator.clipboard.writeText(currentUser.link_code).then(() => {
                    setCopyMsg("Đã copy!");
                    setTimeout(() => setCopyMsg(""), 2000);
                  });
                }
              }}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              {copyMsg || "Sao chép"}
            </button>
            <button
              type="button"
              disabled={rotateLoading}
              onClick={async () => {
                if (!confirm("Tạo mã mới sẽ làm mã cũ hết hiệu lực. Tiếp tục?")) return;
                setRotateLoading(true);
                try {
                  const updated = await authRotateLinkCode();
                  const token = getToken() ?? "";
                  saveAuth(token, updated);
                  setCurrentUser(updated);
                } catch {
                  alert("Không thể tạo mã mới. Vui lòng thử lại.");
                } finally {
                  setRotateLoading(false);
                }
              }}
              className="rounded-lg border border-yellow-700 px-3 py-1.5 text-xs text-yellow-300 hover:bg-yellow-900/30 disabled:opacity-50"
            >
              {rotateLoading ? "Đang tạo…" : "Tạo mã mới"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            ⚠️ Khi tạo mã mới, mã cũ sẽ hết hiệu lực ngay lập tức. Các liên kết đã xác nhận không bị ảnh hưởng.
          </p>

          {/* Incoming link requests */}
          {incomingLinks.length > 0 && (
            <div className="border-t border-zinc-800 pt-3 space-y-2">
              <p className="text-sm font-medium text-zinc-300">Yêu cầu liên kết đang chờ</p>
              {incomingLinks
                .filter((l) => l.status === "pending")
                .map((link) => (
                  <div key={link.id} className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                    <div>
                      <p className="text-xs text-zinc-300">Phụ huynh ID: {link.parent_id}</p>
                      <p className="text-xs text-zinc-500">{new Date(link.created_at).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await studentRespondLink(link.id, "active");
                          setIncomingLinks((prev) =>
                            prev.map((l) => l.id === link.id ? { ...l, status: "active" } : l)
                          );
                        }}
                        className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-600/40"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={async () => {
                          await studentRespondLink(link.id, "rejected");
                          setIncomingLinks((prev) =>
                            prev.map((l) => l.id === link.id ? { ...l, status: "rejected" } : l)
                          );
                        }}
                        className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-300 hover:bg-red-600/40"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              {incomingLinks.filter((l) => l.status !== "pending").map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                  <p className="text-xs text-zinc-500">Phụ huynh ID: {link.parent_id}</p>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${link.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                    {link.status === "active" ? "Đã liên kết" : "Đã từ chối"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            <label className="text-sm text-zinc-400">
              Giới hạn phút học/ngày mong muốn
              {isLocked("daily_limit_minutes") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <input
              type="number"
              min={60}
              max={600}
              disabled={isLocked("daily_limit_minutes")}
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={
                isLocked("daily_limit_minutes")
                  ? (effective?.locked_values?.["daily_limit_minutes"] ?? form.dailyLimitPreference)
                  : form.dailyLimitPreference
              }
              onChange={(e) => handleChange("dailyLimitPreference", Number(e.target.value))}
            />
            {isLocked("daily_limit_minutes") && (
              <p className="mt-1 text-xs text-yellow-300">
                Giá trị đang áp dụng: <strong>{effective?.effective_values?.["daily_limit_minutes"]}</strong> phút/ngày (Phụ huynh đặt 🔒)
                {effective?.student_values?.["daily_limit_minutes"] != null && (
                  <span className="ml-1 text-zinc-500">· Giá trị bạn từng đặt: {effective.student_values["daily_limit_minutes"]} (không áp dụng khi đang khoá)</span>
                )}
              </p>
            )}
          </div>

          {/* Break preset — select */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">
              Preset nghỉ ưa thích
              {isLocked("break_preset") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <select
              disabled={isLocked("break_preset")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Timezone — GMT offset picker */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-400">
              Múi giờ (GMT)
              {isLocked("timezone") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <select
              disabled={isLocked("timezone")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={form.tzOffsetMinutes}
              onChange={(e) => handleChange("tzOffsetMinutes", Number(e.target.value))}
            >
              {GMT_OFFSETS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">
              Hiện tại: <code>{GMT_OFFSETS.find((o) => o.value === form.tzOffsetMinutes)?.label ?? `GMT offset ${form.tzOffsetMinutes}m`}</code>
            </p>
          </div>

          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black" type="submit">
            Lưu hồ sơ
          </button>
        </form>
      </section>
    </div>
  );
}
