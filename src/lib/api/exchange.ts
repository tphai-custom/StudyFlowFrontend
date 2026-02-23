import { apiFetch, apiGet, apiPost } from "./client";

export interface ExchangeMessage {
  id: string;
  parent_id: string;
  student_id: string;
  sender_role: string;
  tag: string;
  content: string;
  status: string; // unread | read | replied
  read_at?: string | null;
  replied_at?: string | null;
  student_quick_reply?: string | null;
  student_reply_text?: string | null;
  pinned: boolean;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}

// ── Parent endpoints ───────────────────────────────────────────────────────

export const parentSendMessage = (childId: string, content: string, tag: string = "other") =>
  apiPost<ExchangeMessage>(`/parent/${childId}/messages`, { content, tag });

export const parentListMessages = (childId: string) =>
  apiGet<ExchangeMessage[]>(`/parent/${childId}/messages`);

// ── Student endpoints ──────────────────────────────────────────────────────

export const studentListMessages = (filter: "all" | "unread" | "needs_action" | "done" = "all") =>
  apiGet<ExchangeMessage[]>(`/student/messages?filter=${filter}`);

export const studentGetUnreadCount = () =>
  apiGet<UnreadCount>("/student/messages/unread-count");

export const studentGetMessage = (id: string) =>
  apiGet<ExchangeMessage>(`/student/messages/${id}`);

export const studentMarkRead = (id: string) =>
  apiPost<ExchangeMessage>(`/student/messages/${id}/mark-read`, {});

export const studentReply = (
  id: string,
  quick_reply: string,
  reply_text?: string,
) =>
  apiPost<ExchangeMessage>(`/student/messages/${id}/reply`, {
    quick_reply,
    reply_text,
  });

export const studentPinMessage = (id: string) =>
  apiPost<ExchangeMessage>(`/student/messages/${id}/pin`, {});

// ── Convert message → actions ──────────────────────────────────────────────

export const actionCreateTask = (
  id: string,
  title?: string,
  subject?: string,
) =>
  apiPost<{ task_id: string; title: string }>(
    `/student/messages/${id}/actions/create-task`,
    { title, subject },
  );

export const actionAddChecklistItem = (
  id: string,
  task_id: string,
  item: string,
) =>
  apiPost<{ task_id: string; added_item: string }>(
    `/student/messages/${id}/actions/add-checklist-item`,
    { task_id, item },
  );

export const actionCreateSession = (id: string, minutes: 25 | 45) =>
  apiPost<{ task_id: string; minutes: number; title: string }>(
    `/student/messages/${id}/actions/create-session`,
    { minutes },
  );

export const actionPinToday = (id: string) =>
  apiPost<{ pinned: boolean; message_id: string }>(
    `/student/messages/${id}/actions/pin-today`,
    {},
  );
