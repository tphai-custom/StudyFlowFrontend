"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getUser } from "@/src/lib/auth";
import { listLibraryV2, adminSeedLibraryV2 } from "@/src/lib/storage/libraryRepo";
import { LibraryItemV2 } from "@/src/lib/types";
import { PageHeader } from "@/src/components/PageHeader";

const SUBJECTS = [
  { value: "toan", label: "Toan" },
  { value: "ngu_van", label: "Ngu van" },
  { value: "tieng_anh", label: "Tieng Anh" },
  { value: "lich_su", label: "Lich su" },
  { value: "dia_li", label: "Dia li" },
];
const GRADES = [6, 7, 8, 9, 10];
const SUBJECT_LABELS: Record<string, string> = {
  toan: "Toan", ngu_van: "Ngu van", tieng_anh: "Tieng Anh", lich_su: "Lich su", dia_li: "Dia li",
};
const SECTION_CONFIG = [
  { key: "lessons",   label: "Bai hoc",  icon: "book",  color: "text-sky-300",     bg: "bg-sky-500/10",     border: "border-sky-500/20" },
  { key: "summaries", label: "Tom tat",  icon: "memo",  color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "exercises", label: "Bai tap",  icon: "pencil",color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  { key: "videos",    label: "Video",    icon: "film",  color: "text-rose-300",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
] as const;

export default function LibraryPage() {
  const user = typeof window !== "undefined" ? getUser() : null;
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState<LibraryItemV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");

  const [seedOpen, setSeedOpen] = useState(false);
  const [seedGrades, setSeedGrades] = useState<number[]>([...GRADES]);
  const [seedSubjects, setSeedSubjects] = useState<string[]>(SUBJECTS.map(s => s.value));
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchItems = useCallback(async (g: string, s: string, q: string) => {
    setLoading(true); setError("");
    try {
      const data = await listLibraryV2(g ? Number(g) : undefined, s || undefined, q || undefined);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Khong the tai du lieu."); setItems([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems("", "", ""); }, [fetchItems]);

  const applyFilters = (g: string, s: string, q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchItems(g, s, q), 250);
  };

  const handleSeed = async () => {
    if (!seedGrades.length || !seedSubjects.length) { setSeedMsg("Vui long chon it nhat 1 lop va 1 mon."); return; }
    setSeedLoading(true); setSeedMsg("");
    try {
      const res = await adminSeedLibraryV2(seedGrades, seedSubjects);
      setSeedMsg("Thanh cong: them " + res.inserted_count + ", cap nhat " + res.updated_count + ".");
      fetchItems(grade, subject, query);
    } catch (e) { setSeedMsg(e instanceof Error ? e.message : "Seed that bai."); }
    finally { setSeedLoading(false); }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6">
      <PageHeader title="Thu vien hoc tap" description="Tai lieu lop 6-10 - 5 mon co ban. Loc va tim kiem nhanh." />

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">Bo loc</h2>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-200" value={grade}
            onChange={e => { setGrade(e.target.value); applyFilters(e.target.value, subject, query); }}>
            <option value="">Tat ca lop</option>
            {GRADES.map(g => <option key={g} value={String(g)}>Lop {g}</option>)}
          </select>
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-200" value={subject}
            onChange={e => { setSubject(e.target.value); applyFilters(grade, e.target.value, query); }}>
            <option value="">Tat ca mon</option>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-200 placeholder-zinc-500"
            placeholder="Tim kiem tu khoa..." value={query}
            onChange={e => { setQuery(e.target.value); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchItems(grade, subject, e.target.value), 350); }} />
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={() => fetchItems(grade, subject, query)}>Tim</button>
          {(grade || subject || query) && (
            <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
              onClick={() => { setGrade(""); setSubject(""); setQuery(""); fetchItems("", "", ""); }}>Xoa bo loc</button>
          )}
        </div>
        <p className="text-xs text-zinc-500">{loading ? "Dang tai..." : items.length + " tai lieu"}</p>
      </section>

      {isAdmin && (
        <section className="card space-y-3">
          <button className="flex w-full items-center justify-between text-sm font-semibold text-zinc-300"
            onClick={() => setSeedOpen(o => !o)}>
            <span>Seed thu vien (Admin)</span>
            <span className="text-zinc-500">{seedOpen ? "collapse" : "expand"}</span>
          </button>
          {seedOpen && (
            <div className="space-y-3 pt-1">
              <div>
                <p className="mb-1.5 text-xs text-zinc-400">Chon lop:</p>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map(g => (
                    <button key={g} onClick={() => setSeedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                      className={"rounded-lg border px-3 py-1 text-sm transition-colors " + (seedGrades.includes(g) ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500")}>
                      Lop {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-zinc-400">Chon mon:</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s.value} onClick={() => setSeedSubjects(prev => prev.includes(s.value) ? prev.filter(x => x !== s.value) : [...prev, s.value])}
                      className={"rounded-lg border px-3 py-1 text-sm transition-colors " + (seedSubjects.includes(s.value) ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500")}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-emerald-700"
                disabled={seedLoading} onClick={handleSeed}>
                {seedLoading ? "Dang seed..." : "Seed " + seedGrades.length + " lop x " + seedSubjects.length + " mon"}
              </button>
              {seedMsg && <p className={"text-sm " + (seedMsg.includes("that bai") ? "text-red-400" : "text-emerald-400")}>{seedMsg}</p>}
            </div>
          )}
        </section>
      )}

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {!loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-16 text-center">
          <span className="mb-4 text-5xl">📚</span>
          <h3 className="mb-1 text-lg font-semibold text-zinc-100">Chua co tai lieu nao</h3>
          <p className="mb-6 max-w-sm text-sm text-zinc-400">
            {isAdmin ? 'Nhan "Seed thu vien" de nhap du lieu mau.' : "Hay lien he quan tri vien de them tai lieu."}
          </p>
          {isAdmin && (
            <button className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={() => setSeedOpen(true)}>Seed thu vien</button>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map(item => <LibraryCard key={item.id} item={item} />)}
        </ul>
      )}
    </div>
  );
}

function LibraryCard({ item }: { item: LibraryItemV2 }) {
  return (
    <li className="card flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-300">Lop {item.grade}</span>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">{SUBJECT_LABELS[item.subject] ?? item.subject}</span>
        <h3 className="ml-1 text-sm font-bold text-zinc-100">{item.title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECTION_CONFIG.map(({ key, label, color, bg, border }) => {
          const rows: string[] = (item as unknown as Record<string, string[]>)[key] ?? [];
          return (
            <div key={key} className={"rounded-xl border " + border + " " + bg + " p-3"}>
              <p className={"mb-2 text-xs font-bold uppercase tracking-wide " + color}>{label}</p>
              <ul className="space-y-1">
                {rows.map((row, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-zinc-300">
                    <span className="mt-0.5 shrink-0 text-zinc-500">•</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {item.tags.length > 0 && <p className="text-xs text-zinc-500">{item.tags.map(t => "#" + t).join("  ")}</p>}
    </li>
  );
}
