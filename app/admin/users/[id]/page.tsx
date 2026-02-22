"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminGetUser,
  adminGetUserTasks,
  adminGetUserFeedback,
  adminUpdateFeedback,
  adminGetPlanOverride,
  adminSavePlanOverride,
  AdminFeedback,
  PlanOverride,
  PlanOverrideCreate,
} from "@/src/lib/api/admin";
import { AuthUser, ROLE_LABELS } from "@/src/lib/auth";
import { Task } from "@/src/lib/types";

type Tab = "tasks" | "feedback" | "plan";

const SUBJECT_LABELS: Record<string, string> = {
  toan: "Toán", ngu_van: "Ngữ văn", tieng_anh: "Tiếng Anh",
  lich_su: "Lịch sử", dia_li: "Địa lí",
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<Tab>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [override, setOverride] = useState<PlanOverride | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Plan override edit state
  const [overrideDraft, setOverrideDraft] = useState<string>("[]");
  const [overrideDateStart, setOverrideDateStart] = useState("");
  const [overrideDateEnd, setOverrideDateEnd] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t, fb, ov] = await Promise.all([
        adminGetUser(id),
        adminGetUserTasks(id),
        adminGetUserFeedback(id),
        adminGetPlanOverride(id),
      ]);
      setUser(u);
      setTasks(t);
      setFeedbacks(fb);
      setOverride(ov);
      if (ov) {
        setOverrideDraft(JSON.stringify(ov.payload, null, 2));
        setOverrideDateStart(ov.date_start ?? "");
        setOverrideDateEnd(ov.date_end ?? "");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleFeedbackUpdate = async (
    fb: AdminFeedback,
    updates: { status?: "open" | "closed"; admin_reply?: string },
  ) => {
    setMsg(""); setErr("");
    try {
      const updated = await adminUpdateFeedback(fb.id, updates);
      setFeedbacks((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setMsg("Đã cập nhật phản hồi");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Thao tác thất bại");
    }
  };

  const handleSaveOverride = async () => {
    setMsg(""); setErr("");
    let payload: unknown[];
    try {
      payload = JSON.parse(overrideDraft);
    } catch {
      setErr("JSON không hợp lệ – kiểm tra lại payload");
      return;
    }
    try {
      const data: PlanOverrideCreate = {
        date_start: overrideDateStart || null,
        date_end: overrideDateEnd || null,
        payload,
      };
      const saved = await adminSavePlanOverride(id, data);
      setOverride(saved);
      setMsg("Đã lưu override kế hoạch");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lưu thất bại");
    }
  };

  if (loading) return <p className="text-sm text-zinc-400 p-6">Đang tải…</p>;
  if (!user) return <p className="text-sm text-red-400 p-6">Không tìm thấy người dùng</p>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            @{user.username} · {user.last_name} {user.first_name}
          </h1>
          <p className="text-sm text-zinc-400">
            {ROLE_LABELS[user.role]} · {user.is_active ? "Hoạt động" : "Đã khóa"}
          </p>
        </div>
      </div>

      {msg && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{msg}</p>}
      {err && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{err}</p>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {(["tasks", "feedback", "plan"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "tasks" ? `Nhiệm vụ (${tasks.length})` : t === "feedback" ? `Phản hồi (${feedbacks.length})` : "Chỉnh sửa kế hoạch"}
          </button>
        ))}
      </div>

      {/* Tab: Tasks */}
      {tab === "tasks" && (
        <section className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-zinc-400">Người dùng chưa có nhiệm vụ nào.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Môn</th>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Tên nhiệm vụ</th>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Deadline</th>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Khó</th>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Tiến độ</th>
                    <th className="px-3 py-2 text-left text-xs text-zinc-500">Khóa (PH)</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                      <td className="px-3 py-2 text-xs text-zinc-400">
                        {SUBJECT_LABELS[task.subject] ?? task.subject}
                      </td>
                      <td className="px-3 py-2">{task.title}</td>
                      <td className="px-3 py-2 text-xs text-zinc-400">
                        {task.deadline.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 text-xs text-center">{task.difficulty}/5</td>
                      <td className="px-3 py-2 text-xs text-zinc-400">
                        {task.progressMinutes}/{task.estimatedMinutes}m
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {task.lockedByParent ? (
                          <span className="text-amber-400">🔒</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab: Feedback */}
      {tab === "feedback" && (
        <section className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-sm text-zinc-400">Không có phản hồi nào.</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className={`card space-y-2 ${fb.status === "closed" ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {new Date(fb.submittedAt).toLocaleString("vi-VN")} · Phiên bản {fb.planVersion}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      fb.status === "open" ? "bg-amber-500/20 text-amber-300" : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {fb.status === "open" ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>
                <p className="text-sm"><strong>{fb.label}</strong>{fb.note ? ` – ${fb.note}` : ""}</p>

                {/* Admin reply */}
                <AdminReplyForm
                  fb={fb}
                  onUpdate={(updates) => handleFeedbackUpdate(fb, updates)}
                />
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab: Plan override */}
      {tab === "plan" && (
        <section className="space-y-4">
          <div className="card space-y-3">
            <h2 className="font-semibold text-zinc-200">Ghi đè kế hoạch</h2>
            <p className="text-xs text-zinc-400">
              Chỉnh sửa danh sách session cho người dùng. Payload là JSON array chứa danh sách session đã sửa.
              {override && (
                <> · Lần sửa cuối: {new Date(override.updated_at).toLocaleString("vi-VN")}</>
              )}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs text-zinc-400">Từ ngày (ISO)</label>
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
                  placeholder="2026-02-22"
                  value={overrideDateStart}
                  onChange={(e) => setOverrideDateStart(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-zinc-400">Đến ngày (ISO)</label>
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
                  placeholder="2026-02-28"
                  value={overrideDateEnd}
                  onChange={(e) => setOverrideDateEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-zinc-400">
                Payload (JSON array sessions)
                <span className="ml-2 text-zinc-600">– mỗi item: {"{"} id, title, plannedStart, plannedEnd, adminEdited: true {"}"}</span>
              </label>
              <textarea
                className="h-48 rounded-lg border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs"
                value={overrideDraft}
                onChange={(e) => setOverrideDraft(e.target.value)}
                placeholder='[{"id": "...", "title": "...", "plannedStart": "...", "plannedEnd": "...", "adminEdited": true}]'
              />
            </div>

            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              onClick={handleSaveOverride}
            >
              Lưu override
            </button>
          </div>

          {override && (
            <div className="card space-y-2 border-zinc-700/50">
              <p className="text-xs text-zinc-500">
                Đã lưu bởi admin ID: <code>{override.edited_by}</code> · {new Date(override.updated_at).toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-zinc-500">
                Phạm vi: {override.date_start ?? "?"} → {override.date_end ?? "?"}
              </p>
              <pre className="text-xs text-zinc-400 overflow-auto max-h-40">
                {JSON.stringify(override.payload, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AdminReplyForm({
  fb,
  onUpdate,
}: {
  fb: AdminFeedback;
  onUpdate: (u: { status?: "open" | "closed"; admin_reply?: string }) => void;
}) {
  const [reply, setReply] = useState(fb.admin_reply ?? "");
  return (
    <div className="space-y-2 border-t border-zinc-700/50 pt-2">
      <textarea
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm"
        rows={2}
        placeholder="Trả lời phản hồi..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
          onClick={() => onUpdate({ admin_reply: reply })}
        >
          Gửi trả lời
        </button>
        {fb.status === "open" ? (
          <button
            className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
            onClick={() => onUpdate({ status: "closed", admin_reply: reply || undefined })}
          >
            Đóng phản hồi
          </button>
        ) : (
          <button
            className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
            onClick={() => onUpdate({ status: "open" })}
          >
            Mở lại
          </button>
        )}
      </div>
      {fb.admin_reply && (
        <p className="text-xs text-zinc-500">Trả lời hiện tại: {fb.admin_reply}</p>
      )}
    </div>
  );
}
