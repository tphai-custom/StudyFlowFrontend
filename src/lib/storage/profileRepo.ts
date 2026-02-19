import { UserProfile } from "@/src/lib/types";
import { apiGet, apiPut } from "@/src/lib/api/client";

export async function getUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/profile/");
}

export async function saveUserProfile(profile: Omit<UserProfile, "updatedAt">): Promise<UserProfile> {
  return apiPut<UserProfile>("/profile/", profile);
}
