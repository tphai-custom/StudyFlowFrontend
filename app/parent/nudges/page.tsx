"use client";

import { useEffect, useState } from "react";
import {
  parentGetLinkedStudents,
  parentGetNudges,
  parentCreateNote,
  parentListNotes,
  LinkedStudentInfo,
  NudgeMessage,
  NoteSchema,
} from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

const TONE_OPTIONS = [
  { value: "light", label: "Nhẹ nhàng" },
  { value: "medium", label: "Bình thường" },
  { value: "strict", label: "Nghiêm túc" },
];

const NOTE_TAGS = ["động lực", "nhắc nhở", "khen ngợi", "góp ý", "khác"];

export default function ParentNudgesPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tone, setTone] = useState<"light" | "medium" | "strict">("light");
  const [reminderHour, setReminderHour] = useState<number>(20);

  // Hydrate reminderHour from localStorage (client only)
  useEffect(() => {
    const saved = localStorage.getItem("parent_reminder_hour");
    if (saved !== null) setReminderHour(Number(saved));
  }, []);

  // Nudges
  const [nudges, setNudges] = useState<NudgeMessage[]>([]);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeErr, setNudgeErr] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Journal / Notes
  const [notes, setNotes] = useState<NoteSchema[]>([]);
  const [noteLoading, setNoteLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newTag, setNewTag] = useState("nhắc nhở");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    parentGetLinkedStudents()
      .then((list) => {
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].student_id);
      })
      .catch(() => {});
  }, []);

  const fetchNudges = async () => {
    if (!selectedId) return;
    setNudgeLoading(true);
    setNudgeErr("");
    try {
      const data = await parentGetNudges(selectedId, tone);
      setNudges(data.messages ?? []);
    } catch {
      setNudgeErr("Không thể tải gợi ý. Thử lại sau.");
    } finally {
      setNudgeLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!selectedId) return;
    setNoteLoading(true);
    try {
      const data = await parentListNotes(selectedId);
      setNotes(data);
    } catch {
      /* ignore */
    } finally {
      setNoteLoading(false);
    }
  };

  useEffect(() => {
    fetchNudges();
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tone]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;
    setSubmitting(true);
    try {
      const note = await parentCreateNote(selectedId, newMessage.trim(), newTag);
      setNotes((prev) => [note, ...prev]);
      setNewMessage("");
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.student_id === selectedId);

  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-4">
      <PageHeader
        title="Nhắc & Gợi ý"
        description="Nhận gợi ý nhắn tin cho con và để lại nhật ký động viên."
      />

      {students.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa liên kết với học sinh nào"
          description="Thêm con em trước khi sử dụng tính năng này."
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Student + tone selector */}
          <div className="flex flex-wrap items-center gap-4">
            {students.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="nudgeStudent" className="text-sm text-zinc-400">Học sinh:</label>
                <select
                  id="nudgeStudent"
                  name="nudgeStudent"
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.full_name || s.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label htmlFor="toneSelect" className="text-sm text-zinc-400">Giọng điệu:</label>
              <select
                id="toneSelect"
                name="toneSelect"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
                value={tone}
                onChange={(e) => setTone(e.target.value as "light" | "medium" | "strict")}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="reminderHour" className="text-sm text-zinc-400">🔔 Giờ nhắc:</label>
              <select
                id="reminderHour"
                name="reminderHour"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
                value={reminderHour}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  setReminderHour(h);
                  localStorage.setItem("parent_reminder_hour", String(h));
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">nhắc nhở hàng ngày</span>
            </div>
          </div>

          {/* Nudge messages section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-200">
                💬 Gợi ý nhắn tin{selectedStudent ? ` cho ${selectedStudent.full_name || selectedStudent.username}` : ""}
              </h2>
              <button
                onClick={fetchNudges}
                disabled={nudgeLoading}
                className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                {nudgeLoading ? "Đang tạo…" : "🔄 Tạo lại"}
              </button>
            </div>

            {nudgeErr && <p className="text-sm text-red-400">{nudgeErr}</p>}

            {nudgeLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : nudges.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center">
                <p className="text-sm text-zinc-400">Chưa có gợi ý nào. Nhấn "Tạo lại" để bắt đầu.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {nudges.map((n, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4">
                    <p className="flex-1 text-sm text-zinc-200 leading-relaxed">{n.text}</p>
                    <button
                      onClick={() => handleCopy(n.text, i)}
                      className="shrink-0 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      {copiedIdx === i ? "✓ Đã sao chép" : "Sao chép"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Journal / Notes section */}
          <section className="space-y-4">
            <h2 className="font-semibold text-zinc-200">📓 Nhật ký ghi chú</h2>
            <p className="text-xs text-zinc-500">
              Ghi lại những lời động viên, nhắc nhở, hoặc ghi chú cho con. Con có thể xem và phản hồi.
            </p>

            {/* Create note form */}
            <form onSubmit={handleCreateNote} className="space-y-3 rounded-xl border border-zinc-700/60 p-4">
              <div className="flex flex-col gap-2">
                <textarea
                  id="noteMessage"
                  name="noteMessage"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Viết lời nhắn hoặc ghi chú cho con..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1">
                    {NOTE_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setNewTag(tag)}
                        className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                          newTag === tag
                            ? "bg-emerald-500 text-black font-medium"
                            : "bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newMessage.trim()}
                    className="shrink-0 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi…" : "Gửi"}
                  </button>
                </div>
              </div>
            </form>

            {/* Notes list */}
            {noteLoading ? (
              <p className="text-sm text-zinc-400">Đang tải…</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-zinc-500">Chưa có ghi chú nào. Hãy gửi lời động viên đầu tiên!</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-xl border border-zinc-700/60 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-zinc-200 flex-1">{note.message}</p>
                      {note.tag && (
                        <span className="shrink-0 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                          {note.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        {new Date(note.created_at).toLocaleString("vi-VN")}
                      </span>
                      {note.reaction && (
                        <span className="text-sm">{note.reaction}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
