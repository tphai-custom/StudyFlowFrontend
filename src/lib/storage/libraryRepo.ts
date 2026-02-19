import { LibraryItem } from "@/src/lib/types";
import { apiGet, apiPost } from "@/src/lib/api/client";

export async function listLibrary(): Promise<LibraryItem[]> {
  return apiGet<LibraryItem[]>("/library/");
}

export async function saveLibraryItems(items: LibraryItem[]): Promise<void> {
  await apiPost<LibraryItem[]>("/library/", items);
}

export async function searchLibrary(query: string, subject?: string): Promise<LibraryItem[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (subject) params.set("subject", subject);
  const qs = params.toString();
  return apiGet<LibraryItem[]>(`/library/${qs ? `?${qs}` : ""}`);
}
