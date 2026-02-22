"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { adminListUsers, adminUpdateUser, adminResetPassword } from "@/src/lib/api/admin";
import { AuthUser, ROLE_LABELS } from "@/src/lib/auth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    adminListUsers()
      .then(setUsers)
      .catch(() => setErr("Không thể tải danh sách người dùng"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (user: AuthUser) => {
    setMsg("");
    setErr("");
    try {
      const updated = await adminUpdateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setMsg(`Đã ${updated.is_active ? "kích hoạt" : "khoá"} tài khoản ${updated.username}`);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Thao tác thất bại");
    }
  };

  const handleResetPw = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setMsg("");
    setErr("");
    try {
      await adminResetPassword(resetTarget, newPw);
      setMsg("Đổi mật khẩu thành công");
      setResetTarget(null);
      setNewPw("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button
          onClick={load}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
        >
          Làm mới
        </button>
      </div>

      {msg && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{msg}</p>}
      {err && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{err}</p>}

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Username</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Mã liên kết</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-surface-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{user.username}</td>
                  <td className="px-4 py-3 text-zinc-200">
                    {user.last_name} {user.first_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-300"
                          : user.role === "parent"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {user.link_code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${user.is_active ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {user.is_active ? "Hoạt động" : "Bị khoá"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700"
                      >
                        Chi tiết
                      </Link>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => toggleActive(user)}
                          className={`rounded px-2 py-0.5 text-xs ${
                            user.is_active
                              ? "bg-red-600/20 text-red-300 hover:bg-red-600/40"
                              : "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40"
                          }`}
                        >
                          {user.is_active ? "Khoá" : "Kích hoạt"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setResetTarget(user.id);
                          setNewPw("");
                          setMsg("");
                          setErr("");
                        }}
                        className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700"
                      >
                        Đặt lại mật khẩu
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-xl bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 font-semibold text-zinc-100">Đặt lại mật khẩu</h3>
            <form onSubmit={handleResetPw} className="space-y-4">
              <div className="grid gap-1">
                <label className="text-sm text-zinc-300">Mật khẩu mới (≥6 ký tự)</label>
                <input
                  type="password"
                  className="rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {err && <p className="text-sm text-red-400">{err}</p>}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 text-sm">
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="flex-1 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:bg-zinc-800"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
