"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDraft, updateDraft, finalizeDraft, DraftItem } from "@/src/lib/storage/draftsRepo";

const DIFFICULTY_LABELS = ["", "Rất dễ", "Dễ", "Trung bình", "Khó", "Rất khó"];

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params?.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    if (!draftId) return;
    setLoading(true);
    try {
      const draft = await getDraft(draftId);
      setName(draft.name);
      setDescription(draft.description);
      setItems(draft.items);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await updateDraft(draftId, { name, description, items });
      setStatus("✓ Đã lưu draft");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setSaving(true);
    try {
      await updateDraft(draftId, { name, description, items });
      const result = await finalizeDraft(draftId);
      setStatus(`✓ Đã tạo ${result.count} nhiệm vụ! Đang chuyển về Nhiệm vụ...`);
      setTimeout(() => router.push("/tasks"), 1500);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index: number, field: keyof DraftItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem: DraftItem = {
      id: crypto.randomUUID(),
      title: "Nhiệm vụ mới",
      durationMin: 30,
      difficulty: 3,
      subject: "",
      successCriteria: "Hoàn thành mục tiêu",
      orderIndex: items.length,
      notes: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const target = index + direction;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);
  };

  if (loading) return <p className="text-sm text-zinc-400 p-6">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Chỉnh sửa Draft</h1>
        <p className="text-sm text-zinc-400">Sửa tên, tiêu chí, độ khó rồi nhấn "Chuyển thành Nhiệm vụ".</p>
        {status && <p className="text-xs text-emerald-400 mt-1">{status}</p>}
      </header>

      {/* Draft meta */}
      <section className="card space-y-3">
        <div className="grid gap-1">
          <label className="text-sm text-zinc-400">Tên kế hoạch</label>
          <input
            className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm text-zinc-400">Mô tả / Mục tiêu</label>
          <textarea
            className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </section>

      {/* Items */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Danh sách mục ({items.length})</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-emerald-400/60 px-3 py-1 text-sm text-emerald-300 hover:bg-emerald-500/10"
          >
            + Thêm mục
          </button>
        </div>

        {items.map((item, index) => (
          <div key={item.id} className="card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">#{index + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-500"
                  disabled={index === 0}
                >↑</button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-500"
                  disabled={index === items.length - 1}
                >↓</button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/10"
                >✕</button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs text-zinc-500">Tên mục</label>
                <input
                  className="rounded border border-zinc-700 bg-transparent p-1.5 text-sm"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-zinc-500">Môn học</label>
                <input
                  className="rounded border border-zinc-700 bg-transparent p-1.5 text-sm"
                  value={item.subject}
                  onChange={(e) => updateItem(index, "subject", e.target.value)}
                  placeholder="Toán, Anh, Văn…"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-zinc-500">Thời lượng (phút)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  className="rounded border border-zinc-700 bg-transparent p-1.5 text-sm"
                  value={item.durationMin}
                  onChange={(e) => updateItem(index, "durationMin", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-zinc-500">Độ khó — {DIFFICULTY_LABELS[item.difficulty]}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  className="accent-emerald-500"
                  value={item.difficulty}
                  onChange={(e) => updateItem(index, "difficulty", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-zinc-500">Tiêu chí thành công</label>
              <input
                className="rounded border border-zinc-700 bg-transparent p-1.5 text-sm"
                value={item.successCriteria}
                onChange={(e) => updateItem(index, "successCriteria", e.target.value)}
                placeholder="Giải đúng 8/10 bài…"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-zinc-500">Ghi chú</label>
              <input
                className="rounded border border-zinc-700 bg-transparent p-1.5 text-sm"
                value={item.notes}
                onChange={(e) => updateItem(index, "notes", e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl border border-zinc-600 px-4 py-2 text-sm"
        >
          {saving ? "Đang lưu..." : "Lưu draft"}
        </button>
        <button
          type="button"
          onClick={handleFinalize}
          disabled={saving || items.length === 0}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          Chuyển thành Nhiệm vụ ({items.length})
        </button>
      </div>
    </div>
  );
}
