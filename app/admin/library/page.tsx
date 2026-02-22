"use client";

import { useEffect, useState } from "react";
import {
  adminListSystemLibrary,
  adminAddSystemLibraryItems,
  adminDeleteLibraryItem,
  LibraryItem,
  LibraryItemCreate,
} from "@/src/lib/api/admin";

const LEVEL_OPTIONS = ["Lớp 10", "Lớp 11", "Lớp 12", "Đại học", "Khác"];

const emptyForm = (): LibraryItemCreate => ({
  subject: "",
  level: "",
  title: "",
  summary: "",
  url: "",
  tags: [],
});

export default function AdminLibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<LibraryItemCreate>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListSystemLibrary();
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá tài liệu này?")) return;
    setDeletingId(id);
    try {
      await adminDeleteLibraryItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi xoá");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!form.subject || !form.level || !form.title || !form.summary) {
      alert("Vui lòng điền đầy đủ: Môn học, Cấp độ, Tiêu đề, Mô tả");
      return;
    }
    setSaving(true);
    try {
      const created = await adminAddSystemLibraryItems([form]);
      setItems((prev) => [...prev, ...created]);
      setForm(emptyForm());
      setTagInput("");
      setShowAdd(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) {
      setForm((f) => ({ ...f, tags: [...(f.tags ?? []), t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags?.filter((t) => t !== tag) ?? [] }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thư viện hệ thống</h1>
        <button
          onClick={() => { setShowAdd((v) => !v); setForm(emptyForm()); setTagInput(""); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer"
        >
          {showAdd ? "Huỷ" : "+ Thêm tài liệu"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
          <button onClick={load} className="ml-3 underline cursor-pointer">Thử lại</button>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
          <h2 className="font-semibold text-indigo-800 mb-2">Thêm tài liệu mới</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Môn học *</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="VD: Toán, Lý, Hóa..."
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cấp độ *</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              >
                <option value="">-- Chọn --</option>
                {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề *</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Tên tài liệu"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả *</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
              placeholder="Mô tả nội dung tài liệu"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL (tuỳ chọn)</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="https://..."
              value={form.url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500 cursor-pointer">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nhập tag rồi nhấn +"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <button onClick={addTag} className="px-3 py-1.5 bg-indigo-200 rounded-md text-sm cursor-pointer hover:bg-indigo-300">+</button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => { setShowAdd(false); setForm(emptyForm()); }}
              className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50 cursor-pointer"
            >
              Huỷ
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Chưa có tài liệu nào. Nhấn &quot;+ Thêm tài liệu&quot; để bắt đầu.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-white px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">{item.subject}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{item.level}</span>
                  {item.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5">{tag}</span>
                  ))}
                </div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.summary}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-indigo-500 text-xs underline mt-1 inline-block">
                    Xem tài liệu ↗
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="shrink-0 text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded cursor-pointer disabled:opacity-40"
                title="Xoá tài liệu"
              >
                {deletingId === item.id ? "..." : "✕"}
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-right pt-1">{items.length} tài liệu</p>
        </div>
      )}
    </main>
  );
}
