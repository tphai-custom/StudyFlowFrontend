"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDrafts, deleteDraft, ImportDraft } from "@/src/lib/storage/draftsRepo";

export default function DraftProgramsPage() {
  const [drafts, setDrafts] = useState<ImportDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      setDrafts(await listDrafts("program"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => {
    await deleteDraft(id);
    setStatus("Đã xóa draft.");
    refresh();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Draft Programs</h1>
        <p className="text-sm text-zinc-400">
          Import từ Chương trình học rồi chỉnh sửa tại đây trước khi chuyển thành Nhiệm vụ thật.
        </p>
        {status && <p className="text-xs text-emerald-400 mt-1">{status}</p>}
      </header>

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải...</p>
      ) : drafts.length === 0 ? (
        <div className="card space-y-3">
          <p className="text-sm text-zinc-400">Chưa có draft nào.</p>
          <p className="text-xs text-zinc-500">
            Vào{" "}
            <Link href="/programs" className="text-emerald-400 underline">
              Chương trình học
            </Link>{" "}
            → nhấn <strong>"Import &amp; chỉnh sửa"</strong> để tạo draft.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{draft.name}</p>
                <p className="text-xs text-zinc-500">
                  {draft.items.length} mục ·{" "}
                  <span className={draft.status === "finalized" ? "text-emerald-400" : "text-yellow-400"}>
                    {draft.status === "finalized" ? "Đã chuyển thành task" : "Đang chỉnh"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {draft.status === "draft" && (
                  <Link
                    href={`/imports/editor/${draft.id}`}
                    className="rounded-lg border border-sky-400/60 px-3 py-1 text-sm text-sky-300 hover:bg-sky-500/10"
                  >
                    Chỉnh sửa
                  </Link>
                )}
                <button
                  className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300"
                  onClick={() => handleDelete(draft.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
