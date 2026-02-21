import { apiGet, apiPost, apiPatch, apiDelete } from "@/src/lib/api/client";

export type DraftItem = {
  id: string;
  title: string;
  durationMin: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  subject: string;
  successCriteria: string;
  orderIndex: number;
  notes: string;
};

export type ImportDraft = {
  id: string;
  draftType: "template" | "program";
  sourceId: string;
  name: string;
  description: string;
  items: DraftItem[];
  status: "draft" | "finalized";
  createdAt: string;
  updatedAt: string;
};

export type FinalizeResult = {
  ok: boolean;
  createdTaskIds: string[];
  count: number;
};

export async function listDrafts(type?: "template" | "program"): Promise<ImportDraft[]> {
  const suffix = type ? `?type=${type}` : "";
  return apiGet<ImportDraft[]>(`/imports/drafts${suffix}`);
}

export async function getDraft(id: string): Promise<ImportDraft> {
  return apiGet<ImportDraft>(`/imports/drafts/${id}`);
}

export async function createDraft(payload: {
  draftType: "template" | "program";
  sourceId: string;
  name: string;
  description: string;
  items: DraftItem[];
}): Promise<ImportDraft> {
  return apiPost<ImportDraft>("/imports/drafts", payload);
}

export async function updateDraft(id: string, payload: {
  name?: string;
  description?: string;
  items?: DraftItem[];
}): Promise<ImportDraft> {
  return apiPatch<ImportDraft>(`/imports/drafts/${id}`, payload);
}

export async function finalizeDraft(id: string): Promise<FinalizeResult> {
  return apiPost<FinalizeResult>(`/imports/drafts/${id}/finalize`, {});
}

export async function deleteDraft(id: string): Promise<void> {
  return apiDelete(`/imports/drafts/${id}`);
}
