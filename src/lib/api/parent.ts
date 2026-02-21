import { apiGet, apiPost, apiPatch } from "./client";

export interface LinkSchema {
  id: string;
  parent_id: string;
  student_id: string;
  status: string;
  created_at: string;
}

export interface SuggestionSchema {
  id: string;
  parent_id: string;
  student_id: string;
  type: string;
  payload: Record<string, unknown>;
  message?: string | null;
  status: string;
  created_at: string;
}

export const parentRequestLink = (child_username: string, link_code: string) =>
  apiPost<LinkSchema>("/parent/link", { child_username, link_code });

export const parentListLinks = () => apiGet<LinkSchema[]>("/parent/links");

export const parentListChildren = () => apiGet<LinkSchema[]>("/parent/children");

export const parentGetChildTasks = (student_id: string) =>
  apiGet<unknown[]>(`/parent/child/${student_id}/tasks`);

export const parentGetChildPlan = (student_id: string) =>
  apiGet<unknown>(`/parent/child/${student_id}/plan`);

export const parentGetChildHabits = (student_id: string) =>
  apiGet<unknown[]>(`/parent/child/${student_id}/habits`);

export const parentCreateSuggestion = (
  student_id: string,
  payload: { type: string; payload?: Record<string, unknown>; message?: string }
) => apiPost<SuggestionSchema>(`/parent/child/${student_id}/suggestions`, payload);

export const parentListSuggestions = (student_id: string) =>
  apiGet<SuggestionSchema[]>(`/parent/child/${student_id}/suggestions`);

// Student-facing
export const studentIncomingLinks = () => apiGet<LinkSchema[]>("/parent/incoming-links");

export const studentRespondLink = (link_id: string, status: "active" | "rejected") =>
  apiPatch<LinkSchema>(`/parent/links/${link_id}`, { status });

export const studentMySuggestions = () => apiGet<SuggestionSchema[]>("/parent/my-suggestions");

export const studentRespondSuggestion = (
  suggestion_id: string,
  status: "accepted" | "rejected"
) => apiPatch<SuggestionSchema>(`/parent/suggestions/${suggestion_id}`, { status });
