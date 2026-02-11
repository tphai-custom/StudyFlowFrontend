"use client";

import { useEffect, useState } from "react";
import { listLibrary, searchLibrary } from "@/src/lib/storage/libraryRepo";
import { LibraryItem } from "@/src/lib/types";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");

  const refresh = async () => {
    setItems(await listLibrary());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSearch = async () => {
    if (!query && !subject) {
      refresh();
      return;
    }
    setItems(await searchLibrary(query, subject || undefined));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Thư viện học tập</h1>
        <p className="text-sm text-zinc-400">Tài liệu cơ bản lớp 6-10. Lọc theo môn hoặc từ khoá.</p>
      </header>
      <section className="card space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-zinc-700 bg-transparent p-2"
            placeholder="Tìm kiếm từ khóa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-700 bg-transparent p-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Tất cả môn</option>
            <option value="Toán">Toán</option>
            <option value="Văn">Văn</option>
            <option value="KHTN">KHTN</option>
          </select>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-black" onClick={handleSearch}>
            Tìm
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có tài liệu. Nhấn demo để seed dữ liệu.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-xs text-zinc-500 uppercase">{item.subject} · {item.level}</p>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm text-zinc-300">{item.summary}</p>
                <p className="text-xs text-zinc-500">Tags: {item.tags.join(", ")}</p>
                {item.url && (
                  <a className="text-sm text-emerald-400 underline" href={item.url} target="_blank" rel="noreferrer">
                    Mở tài liệu
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
