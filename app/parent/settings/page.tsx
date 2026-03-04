"use client";

import { useEffect, useState } from "react";
import {
  parentGetLinkedStudents,
  parentGetSettingsLock,
  parentUpdateSettingsLock,
  LOCKABLE_FIELDS,
  LinkedStudentInfo,
  SettingsLockSchema,
} from "@/src/lib/api/parent";
import { PageHeader } from "@/src/components/PageHeader";
import { EmptyState } from "@/src/components/EmptyState";

export default function ParentSettingsLockPage() {
  const [students, setStudents] = useState<LinkedStudentInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [lock, setLock] = useState<SettingsLockSchema | null>(null);
  const [lockedFields, setLockedFields] = useState<string[]>([]);
  const [lockedValues, setLockedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    parentGetLinkedStudents()
      .then((list) => {
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].student_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setErr("");
    parentGetSettingsLock(selectedId)
      .then((l) => {
        setLock(l);
        setLockedFields(l.locked_fields ?? []);
        const vals: Record<string, string> = {};
        if (l.locked_values) {
          Object.entries(l.locked_values).forEach(([k, v]) => {
            if (v !== null && v !== undefined) vals[k] = String(v);
          });
        }
        setLockedValues(vals);
      })
      .catch(() => setErr("Không thể tải thông tin khoá cài đặt"))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const toggleField = (key: string) => {
    setLockedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
    setMsg("");
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setErr("");
    try {
      // Build locked_values: only include fields that are locked AND have a value set
      const vals: Record<string, string | number | null> = {};
      for (const f of lockedFields) {
        if (lockedValues[f] !== undefined && lockedValues[f] !== "") {
          const v = lockedValues[f];
          vals[f] = isNaN(Number(v)) ? v : Number(v);
        }
      }
      const updated = await parentUpdateSettingsLock(selectedId, lockedFields, Object.keys(vals).length > 0 ? vals : undefined);
      setLock(updated);
      setMsg("✓ Đã lưu cài đặt khoá.");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setErr("Không thể lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const selectedStudent = students.find((s) => s.student_id === selectedId);

  return (
    <div className="mx-auto max-w-[700px] space-y-6 px-4">
      <PageHeader
        title="Khoá cài đặt học sinh"
        description="Chọn những trường cài đặt mà học sinh không được phép tự thay đổi."
      />

      {students.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="Chưa liên kết với học sinh nào"
          description="Liên kết với con em trước khi quản lý cài đặt."
          primaryCTA={{ label: "Quản lý liên kết", href: "/parent/children" }}
        />
      ) : (
        <>
          {/* Student selector */}
          {students.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Học sinh:</span>
              <select
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

          {err && <p className="text-sm text-red-400">{err}</p>}
          {loading && <p className="text-sm text-zinc-400">Đang tải…</p>}

          {!loading && (
            <div className="card space-y-5">
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Khoá cài đặt của{" "}
                  <span className="text-emerald-300">
                    {selectedStudent?.full_name || selectedStudent?.username}
                  </span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Các trường bị khoá sẽ hiển thị ở chế độ chỉ đọc trên trang cài đặt của học sinh.
                </p>
              </div>

              <ul className="space-y-3">
                {LOCKABLE_FIELDS.map((field) => {
                  const isLocked = lockedFields.includes(field.key);
                  const isNumeric = field.key === "daily_limit_minutes" || field.key === "buffer_percent";
                  return (
                    <li
                      key={field.key}
                      className="rounded-lg border border-zinc-800 px-4 py-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{field.label}</p>
                          <p className="text-xs text-zinc-500 font-mono">{field.key}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleField(field.key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isLocked ? "bg-red-500" : "bg-zinc-700"
                          }`}
                          aria-checked={isLocked}
                          role="switch"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              isLocked ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      {isLocked && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-400">Giá trị bắt buộc:</label>
                          <input
                            type={isNumeric ? "number" : "text"}
                            value={lockedValues[field.key] ?? ""}
                            onChange={(e) =>
                              setLockedValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            placeholder={isNumeric ? "Nhập số" : "Nhập giá trị"}
                            className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white w-36 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-zinc-500">
                            {lockedValues[field.key]
                              ? "(sẽ áp dụng cho học sinh)"
                              : "(để trống = chỉ khoá, không đặt giá trị)"}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {saving ? "Đang lưu…" : "Lưu cài đặt khoá"}
                </button>
                {msg && <p className="text-sm text-emerald-400">{msg}</p>}
              </div>

              {lockedFields.length > 0 && (
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
                  <p className="text-xs text-yellow-300 font-medium">
                    ⚠️ Đang khoá {lockedFields.length} trường:{" "}
                    {LOCKABLE_FIELDS.filter((f) => lockedFields.includes(f.key))
                      .map((f) => f.label)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
