"use client";

import { FormEvent, useEffect, useState } from "react";
import { parentListLinks, parentRequestLink, LinkSchema } from "@/src/lib/api/parent";

export default function ParentChildrenPage() {
  const [links, setLinks] = useState<LinkSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [childUsername, setChildUsername] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    parentListLinks()
      .then(setLinks)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleLink = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSubmitting(true);
    try {
      await parentRequestLink(childUsername.trim(), linkCode.trim().toUpperCase());
      setMsg("Đã gửi yêu cầu liên kết. Chờ học sinh xác nhận.");
      setChildUsername("");
      setLinkCode("");
      load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Không thể gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "Chờ xác nhận",
    active: "Đã kết nối",
    rejected: "Bị từ chối",
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Quản lý liên kết con em</h1>

      {/* Request new link */}
      <div className="card space-y-4">
        <h2 className="font-semibold">Thêm con em mới</h2>
        <p className="text-xs text-zinc-400">
          Nhập username và mã liên kết của học sinh (học sinh xem mã tại mục Cài đặt hồ sơ).
        </p>
        <form onSubmit={handleLink} className="space-y-3">
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Username của học sinh</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
              value={childUsername}
              onChange={(e) => setChildUsername(e.target.value)}
              placeholder="username"
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Mã liên kết (7 ký tự)</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm font-mono uppercase"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
              maxLength={7}
              placeholder="ABC1234"
              required
            />
          </div>
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {submitting ? "Đang gửi…" : "Gửi yêu cầu"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Danh sách liên kết</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Đang tải…</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có liên kết nào.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id} className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                <div>
                  <p className="text-sm text-zinc-200">Student: {link.student_id}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(link.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    link.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : link.status === "rejected"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {statusLabel[link.status] ?? link.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
