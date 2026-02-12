import { UserProfile } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "profile" as const;
const PROFILE_ID = "user-profile";

const DEFAULT_PROFILE: UserProfile = {
  id: PROFILE_ID,
  gradeLevel: "Chưa thiết lập",
  goals: [],
  weakSubjects: [],
  strongSubjects: [],
  learningPace: "balanced",
  energyPreferences: {
    morning: "medium",
    afternoon: "medium",
    evening: "medium",
  },
  dailyLimitPreference: 180,
  favoriteBreakPreset: "Pomodoro 50/10",
  timezone: Intl?.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Ho_Chi_Minh",
  updatedAt: new Date().toISOString(),
};

export async function getUserProfile(): Promise<UserProfile> {
  const [profile] = await readStore<UserProfile>(STORE);
  if (profile) {
    return profile;
  }
  await writeStore(STORE, [DEFAULT_PROFILE]);
  return DEFAULT_PROFILE;
}

export async function saveUserProfile(profile: Omit<UserProfile, "updatedAt">): Promise<UserProfile> {
  const now = new Date().toISOString();
  const normalized: UserProfile = { ...profile, updatedAt: now };
  await writeStore(STORE, [normalized]);
  return normalized;
}
