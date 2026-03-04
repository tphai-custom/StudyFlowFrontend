import { AppSettings } from "@/src/lib/types";
import { apiGet, apiPut } from "@/src/lib/api/client";

export async function getSettings(): Promise<AppSettings> {
  return apiGet<AppSettings>("/settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await apiPut<AppSettings>("/settings", settings);
}
