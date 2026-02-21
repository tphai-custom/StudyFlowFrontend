"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminListUsers } from "@/src/lib/api/admin";
import { AuthUser, ROLE_LABELS } from "@/src/lib/auth";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminListUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byRole = (role: string) => users.filter((u) => u.role === role);
  const active = users.filter((u) => u.is_active);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Tổng quan hệ thống StudyFlow</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải…</p>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Tổng người dùng", value: users.length, color: "text-zinc-200" },
              { label: "Sinh viên", value: byRole("student").length, color: "text-emerald-300" },
              { label: "Phụ huynh", value: byRole("parent").length, color: "text-blue-300" },
              { label: "Đang hoạt động", value: active.length, color: "text-yellow-300" },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-zinc-200">Quản lý nhanh</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/users"
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Quản lý người dùng →
              </Link>
              <Link
                href="/admin/library"
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Thư viện hệ thống →
              </Link>
            </div>
          </div>

          {/* Recent users */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-zinc-200">Người dùng mới nhất</h2>
            <ul className="space-y-2">
              {[...users]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((u) => (
                  <li key={u.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                    <div>
                      <span className="text-sm text-zinc-200">@{u.username}</span>
                      <span className="ml-2 text-xs text-zinc-500">{u.last_name} {u.first_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        u.role === "admin" ? "bg-purple-500/20 text-purple-300"
                        : u.role === "parent" ? "bg-blue-500/20 text-blue-300"
                        : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                      {!u.is_active && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Khóa</span>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
