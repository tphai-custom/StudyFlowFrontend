import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { AuthUser } from "@/src/lib/auth";

export interface LibraryItem {
  id: string;
  subject: string;
  level: string;
  title: string;
  summary: string;
  url?: string | null;
  tags: string[];
}

export interface LibraryItemCreate {
  subject: string;
  level: string;
  title: string;
  summary: string;
  url?: string | null;
  tags?: string[];
}

export const adminListUsers = () => apiGet<AuthUser[]>("/admin/users");

export const adminGetUser = (user_id: string) => apiGet<AuthUser>(`/admin/users/${user_id}`);

export const adminUpdateUser = (user_id: string, payload: { is_active?: boolean }) =>
  apiPatch<AuthUser>(`/admin/users/${user_id}`, payload);

export const adminResetPassword = (user_id: string, new_password: string) =>
  apiPost<{ ok: boolean }>(`/admin/users/${user_id}/reset-password`, { new_password });

// System library management
export const adminListSystemLibrary = () => apiGet<LibraryItem[]>("/admin/library/system");

export const adminAddSystemLibraryItems = (items: LibraryItemCreate[]) =>
  apiPost<LibraryItem[]>("/admin/library", items);

export const adminDeleteLibraryItem = (item_id: string) =>
  apiDelete<void>(`/admin/library/${item_id}`);
