import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { AuthUser } from "@/src/lib/auth";
import type { Task, LibraryItem } from "@/src/lib/types";

export type { LibraryItem };

export interface LibraryItemCreate {
  subject: string;
  level: string;
  title: string;
  summary: string;
  url?: string | null;
  tags?: string[];
}

export interface AdminFeedback {
  id: string;
  label: string;
  note?: string | null;
  planVersion: number;
  owner_user_id: string;
  status: "open" | "closed";
  admin_reply?: string | null;
  submittedAt: string;
}

export interface PlanOverride {
  id: string;
  user_id: string;
  plan_id?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  payload: unknown[];
  edited_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlanOverrideCreate {
  plan_id?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  payload: unknown[];
}

// User management
export const adminListUsers = () => apiGet<AuthUser[]>("/admin/users");

export const adminGetUser = (user_id: string) => apiGet<AuthUser>(`/admin/users/${user_id}`);

export const adminUpdateUser = (user_id: string, payload: { is_active?: boolean }) =>
  apiPatch<AuthUser>(`/admin/users/${user_id}`, payload);

export const adminResetPassword = (user_id: string, new_password: string) =>
  apiPost<{ ok: boolean }>(`/admin/users/${user_id}/reset-password`, { new_password });

// User tasks
export const adminGetUserTasks = (user_id: string) =>
  apiGet<Task[]>(`/admin/users/${user_id}/tasks`);

// User feedback
export const adminGetUserFeedback = (user_id: string) =>
  apiGet<AdminFeedback[]>(`/admin/users/${user_id}/feedback`);

export const adminUpdateFeedback = (
  feedback_id: string,
  payload: { status?: "open" | "closed"; admin_reply?: string },
) => apiPatch<AdminFeedback>(`/admin/feedback/${feedback_id}`, payload);

// Plan override
export const adminGetPlanOverride = (user_id: string) =>
  apiGet<PlanOverride | null>(`/admin/users/${user_id}/plan-override`);

export const adminSavePlanOverride = (user_id: string, payload: PlanOverrideCreate) =>
  apiPost<PlanOverride>(`/admin/users/${user_id}/plan-override`, payload);

// System library management
export const adminListSystemLibrary = () => apiGet<LibraryItem[]>("/admin/library/system");

export const adminAddSystemLibraryItems = (items: LibraryItemCreate[]) =>
  apiPost<LibraryItem[]>("/admin/library", items);

export const adminDeleteLibraryItem = (item_id: string) =>
  apiDelete<void>(`/admin/library/${item_id}`);

