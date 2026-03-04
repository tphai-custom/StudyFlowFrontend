import { LibraryItem, LibraryItemV2 } from "@/src/lib/types";
import { apiGet, apiPost } from "@/src/lib/api/client";

export async function listLibrary(): Promise<LibraryItem[]> {
  return apiGet<LibraryItem[]>("/library");
}

export async function saveLibraryItems(items: LibraryItem[]): Promise<void> {
  await apiPost<LibraryItem[]>("/library", items);
}

export async function searchLibrary(
  query: string,
  subject?: string,
  grade?: number,
  resourceType?: string,
): Promise<LibraryItem[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (subject) params.set("subject", subject);
  if (grade) params.set("grade", String(grade));
  if (resourceType) params.set("type", resourceType);
  const qs = params.toString();
  return apiGet<LibraryItem[]>(`/library/${qs ? `?${qs}` : ""}`);
}

export async function seedLibrary(reseed = false): Promise<{ seeded: number; message: string }> {
  return apiPost(`/library/seed${reseed ? "?reseed=true" : ""}`, {});
}

// ---------------------------------------------------------------------------
// v2 API calls
// ---------------------------------------------------------------------------

export async function listLibraryV2(
  grade?: number,
  subject?: string,
  q?: string,
  limit = 100,
  offset = 0,
): Promise<LibraryItemV2[]> {
  const params = new URLSearchParams();
  if (grade) params.set("grade", String(grade));
  if (subject) params.set("subject", subject);
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return apiGet<LibraryItemV2[]>(`/library/v2?${params.toString()}`);
}

export async function adminSeedLibraryV2(
  grades: number[],
  subjects: string[],
): Promise<{ inserted_count: number; updated_count: number; skipped_count: number }> {
  return apiPost("/admin/library/seed", { grades, subjects, mode: "upsert" });
}
