"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/src/lib/storage/settingsRepo";
import { AppSettings } from "@/src/lib/types";
import { getEffectiveSettings, EffectiveSettingsResult } from "@/src/lib/api/settings";
import { getUser } from "@/src/lib/auth";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [effective, setEffective] = useState<EffectiveSettingsResult | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => setSettings(await getSettings()))();
    const user = getUser();
    if (user?.role === "student") {
      getEffectiveSettings().then(setEffective).catch(() => {});
    }
  }, []);

  const lockedFields = effective?.locked_fields ?? [];
  const isLocked = (key: string) => lockedFields.includes(key);

  const getEffectiveValue = (key: string): string | number | null | undefined =>
    effective?.effective_values?.[key];

  const getLockedValue = (key: string): string | number | null | undefined =>
    effective?.locked_values?.[key];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    if (settings.dailyLimitMinutes < 30 || settings.dailyLimitMinutes > 600) {
      setStatus("dailyLimit phải 30-600 phút.");
      return;
    }
    await saveSettings(settings);
    setStatus("Đã lưu cài đặt.");
  };

  if (!settings) return <p>Đang tải cài đặt...</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Cài đặt & giới hạn</h1>
        <p className="text-sm text-zinc-400">Điều chỉnh daily limit, buffer và preset nghỉ.</p>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
      </header>

      {lockedFields.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <p className="text-xs text-yellow-300">
            🔒 Phụ huynh đã khoá {lockedFields.length} trường. Các trường bị khoá hiển thị disabled và không thể chỉnh sửa.
          </p>
        </div>
      )}

      <section className="card">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-zinc-400">
              Giới hạn phút mỗi ngày (30-600)
              {isLocked("daily_limit_minutes") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <input
              type="number"
              min={30}
              max={600}
              disabled={isLocked("daily_limit_minutes")}
              title={isLocked("daily_limit_minutes") ? "Phụ huynh đã khoá trường này" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              value={isLocked("daily_limit_minutes") ? (getLockedValue("daily_limit_minutes") ?? settings.dailyLimitMinutes) : settings.dailyLimitMinutes}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, dailyLimitMinutes: Number(e.target.value) } : prev))
              }
            />
            {isLocked("daily_limit_minutes") && (
              <p className="mt-1 text-xs text-yellow-300">
                Giá trị đang áp dụng: <strong>{getEffectiveValue("daily_limit_minutes")}</strong> phút/ngày (Phụ huynh đặt 🔒)
                {effective?.student_values?.["daily_limit_minutes"] != null && (
                  <span className="ml-1 text-zinc-500">· Giá trị bạn từng đặt: {effective.student_values["daily_limit_minutes"]} (không áp dụng khi đang khoá)</span>
                )}
              </p>
            )}
            <p className="text-xs text-zinc-500">Chặn nhập ảo kiểu 150000 phút.</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400">
              Buffer (%)
              {isLocked("buffer_percent") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <input
              type="number"
              min={0}
              max={0.5}
              step={0.05}
              disabled={isLocked("buffer_percent")}
              title={isLocked("buffer_percent") ? "Phụ huynh đã khoá trường này" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              value={settings.bufferPercent}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, bufferPercent: Number(e.target.value) } : prev))
              }
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">
              Preset tập trung (phút)
              {isLocked("break_preset") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <input
              type="number"
              min={20}
              max={120}
              disabled={isLocked("break_preset")}
              title={isLocked("break_preset") ? "Phụ huynh đã khoá trường này" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              value={settings.breakPreset.focus}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, breakPreset: { ...prev.breakPreset, focus: Number(e.target.value) } }
                    : prev,
                )
              }
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">
              Preset nghỉ (phút)
              {isLocked("break_preset") && <span className="ml-2 text-xs text-yellow-400">🔒 Khoá</span>}
            </label>
            <input
              type="number"
              min={3}
              max={30}
              disabled={isLocked("break_preset")}
              title={isLocked("break_preset") ? "Phụ huynh đã khoá trường này" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              value={settings.breakPreset.rest}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, breakPreset: { ...prev.breakPreset, rest: Number(e.target.value) } }
                    : prev,
                )
              }
            />
          </div>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-black" type="submit">
            Lưu cài đặt
          </button>
        </form>
      </section>
    </div>
  );
}
