"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/src/lib/storage/settingsRepo";
import { AppSettings } from "@/src/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => setSettings(await getSettings()))();
  }, []);

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
      <section className="card">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-zinc-400">Giới hạn phút mỗi ngày (30-600)</label>
            <input
              type="number"
              min={30}
              max={600}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
              value={settings.dailyLimitMinutes}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, dailyLimitMinutes: Number(e.target.value) } : prev))
              }
            />
            <p className="text-xs text-zinc-500">Chặn nhập ảo kiểu 150000 phút.</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Buffer (%)</label>
            <input
              type="number"
              min={0}
              max={0.5}
              step={0.05}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
              value={settings.bufferPercent}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, bufferPercent: Number(e.target.value) } : prev))
              }
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Preset tập trung (phút)</label>
            <input
              type="number"
              min={20}
              max={120}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
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
            <label className="text-sm text-zinc-400">Preset nghỉ (phút)</label>
            <input
              type="number"
              min={3}
              max={30}
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
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
