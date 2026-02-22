"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listLibrary, searchLibrary, seedLibrary } from "@/src/lib/storage/libraryRepo";
import { LibraryItem } from "@/src/lib/types";
import { getUser } from "@/src/lib/auth";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const SUBJECTS = [
  { value: "toan", label: "Toán" },
  { value: "ngu_van", label: "Ngữ văn" },
  { value: "tieng_anh", label: "Tiếng Anh" },
  { value: "lich_su", label: "Lịch sử" },
  { value: "dia_li", label: "Địa lí" },
];

const GRADES = [6, 7, 8, 9, 10];

const RESOURCE_TYPES = [
  { value: "lesson", label: "Bài học" },
  { value: "summary", label: "Tóm tắt" },
  { value: "worksheet", label: "Bài tập" },
  { value: "video", label: "Video" },
  { value: "book", label: "Sách" },
  { value: "website", label: "Website" },
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Rất dễ", 2: "Dễ", 3: "Trung bình", 4: "Khó", 5: "Rất khó",
};

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [taskModal, setTaskModal] = useState<LibraryItem | null>(null);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [resourceType, setResourceType] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchItems = useCallback(async (q: string, sub: string, gr: string, rt: string) => {
    setLoading(true);
    try {
      const hasFilter = q || sub || gr || rt;
      const data = hasFilter
        ? await searchLibrary(q, sub || undefined, gr ? Number(gr) : undefined, rt || undefined)
        : await listLibrary();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(getUser());
    fetchItems("", "", "", "");
  }, [fetchItems]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(val, subject, grade, resourceType);
    }, 350);
  };

  const handleFilterChange = (
    newSubject: string,
    newGrade: string,
    newType: string,
  ) => {
    setSubject(newSubject);
    setGrade(newGrade);
    setResourceType(newType);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(query, newSubject, newGrade, newType);
    }, 100);
  };

  const handleSeed = async (reseed = false) => {
    setSeedLoading(true);
    setSeedMsg("");
    try {
      const res = await seedLibrary(reseed);
      setSeedMsg(res.message);
      fetchItems(query, subject, grade, resourceType);
    } catch (e) {
      setSeedMsg(e instanceof Error ? e.message : "Seed thất bại");
    } finally {
      setSeedLoading(false);
    }
  };

  const handleCreateTask = (item: LibraryItem) => {
    // Navigate to tasks page with prefill via query params
    const params = new URLSearchParams({
      subject: item.subject,
      title: `Học: ${item.title}`,
      source: "library",
      libraryId: item.id,
    });
    router.push(`/tasks?${params.toString()}`);
  };

  const subjectLabel = (s: string) => SUBJECTS.find((x) => x.value === s)?.label ?? s;
  const typeLabel = (t: string) => RESOURCE_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4">
      <PageHeader
        title="Thư viện học tập"
        description="Tài liệu lớp 6–10 · 5 môn cơ bản. Lọc và tìm kiếm."
      />

      {/* Filters */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">Bộ lọc</h2>
        <div className="flex flex-wrap gap-2">
          {/* Subject */}
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
            value={subject}
            onChange={(e) => handleFilterChange(e.target.value, grade, resourceType)}
          >
            <option value="">Tất cả môn</option>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Grade */}
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
            value={grade}
            onChange={(e) => handleFilterChange(subject, e.target.value, resourceType)}
          >
            <option value="">Tất cả lớp</option>
            {GRADES.map((g) => (
              <option key={g} value={String(g)}>Lớp {g}</option>
            ))}
          </select>

          {/* Type */}
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
            value={resourceType}
            onChange={(e) => handleFilterChange(subject, grade, e.target.value)}
          >
            <option value="">Tất cả loại</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Search */}
          <input
            className="flex-1 min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
            placeholder="Tìm kiếm từ khóa..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />

          {(query || subject || grade || resourceType) && (
            <button
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
              onClick={() => {
                setQuery(""); setSubject(""); setGrade(""); setResourceType("");
                fetchItems("", "", "", "");
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          {loading ? "Đang tải..." : `${items.length} tài liệu`}
        </p>
      </section>

      {/* Admin: seed */}
      {isAdmin && (
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold text-zinc-300">Demo / Seed (Admin)</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={seedLoading}
              onClick={() => handleSeed(false)}
            >
              {seedLoading ? "Đang seed..." : "Seed dữ liệu thư viện"}
            </button>
            <button
              className="rounded-lg border border-orange-500/50 px-4 py-2 text-sm text-orange-400 disabled:opacity-60"
              disabled={seedLoading}
              onClick={() => handleSeed(true)}
            >
              Reset & Seed lại
            </button>
          </div>
          {seedMsg && <p className="text-sm text-emerald-400">{seedMsg}</p>}
        </section>
      )}

      {/* Results */}
      <section className="space-y-3">
        {items.length === 0 && !loading ? (
          <EmptyState
            icon="📚"
            title="Chưa có tài liệu nào"
            description={
              isAdmin
                ? 'Nhấn "Seed dữ liệu thư viện" ở trên để tạo dữ liệu mẫu.'
                : "Hãy thử xóa bộ lọc hoặc liên hệ quản trị viên để seed dữ liệu."
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.id} className="card flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                      {subjectLabel(item.subject)}
                    </span>
                    {item.grade && (
                      <span className="rounded bg-blue-500/15 px-2 py-0.5 text-xs text-blue-300">
                        Lớp {item.grade}
                      </span>
                    )}
                    <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                      {typeLabel(item.resource_type)}
                    </span>
                    {item.difficulty && (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {DIFFICULTY_LABELS[item.difficulty] ?? `Độ khó ${item.difficulty}`}
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-semibold text-zinc-100">{item.title}</p>
                <p className="text-sm text-zinc-400">{item.summary}</p>

                {item.tags.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    {item.tags.map((t) => `#${t}`).join(" ")}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {item.url && (
                    <a
                      className="rounded-lg border border-emerald-500/40 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Mở tài liệu ↗
                    </a>
                  )}
                  <button
                    className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                    onClick={() => handleCreateTask(item)}
                  >
                    + Tạo nhiệm vụ từ tài liệu
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

