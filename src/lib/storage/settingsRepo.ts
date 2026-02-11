import { AppSettings } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "settings" as const;

const DEFAULT_SETTINGS: AppSettings = {
  id: "app-settings",
  dailyLimitMinutes: 180,
  bufferPercent: 0.15,
  breakPreset: {
    focus: 45,
    rest: 10,
    label: "Deep work 45/10",
  },
  timezone: "Asia/Ho_Chi_Minh",
  lastUpdated: new Date().toISOString(),
};

export async function getSettings(): Promise<AppSettings> {
  const [settings] = await readStore<AppSettings>(STORE);
  if (!settings) {
    await writeStore(STORE, [DEFAULT_SETTINGS]);
    return DEFAULT_SETTINGS;
  }
  return settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeStore(STORE, [{ ...settings, lastUpdated: new Date().toISOString() }]);
}
