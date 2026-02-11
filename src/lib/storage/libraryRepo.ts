import { LibraryItem } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "library" as const;

export async function listLibrary(): Promise<LibraryItem[]> {
  return readStore<LibraryItem>(STORE);
}

export async function saveLibraryItems(items: LibraryItem[]): Promise<void> {
  await writeStore(STORE, items);
}

export async function searchLibrary(query: string, subject?: string): Promise<LibraryItem[]> {
  const items = await listLibrary();
  return items.filter((item) => {
    const matchesQuery = query
      ? `${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesSubject = subject ? item.subject === subject : true;
    return matchesQuery && matchesSubject;
  });
}
