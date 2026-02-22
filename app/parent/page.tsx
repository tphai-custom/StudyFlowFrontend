"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parentListChildren, LinkSchema } from "@/src/lib/api/parent";
import { getUser, getFullName, AuthUser } from "@/src/lib/auth";

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<LinkSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
    parentListChildren()
      .then(setChildren)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {user ? getFullName(user) : "Phụ huynh"} 👋</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Đây là bảng điều khiển dành cho phụ huynh. Bạn có thể theo dõi tiến độ học tập của con em.
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Con em đang liên kết</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Đang tải…</p>
        ) : children.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Chưa có liên kết nào.{" "}
            <Link href="/parent/children" className="text-emerald-400 underline">
              Thêm con em
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {children.map((link) => (
              <li key={link.id} className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                <span className="text-sm text-zinc-200">Student ID: {link.student_id}</span>
                <div className="flex gap-2 text-xs">
                  <Link
                    href={`/parent/child/${link.student_id}/tasks`}
                    className="rounded bg-emerald-600/20 px-2 py-1 text-emerald-300 hover:bg-emerald-600/40"
                  >
                    Nhiệm vụ
                  </Link>
                  <Link
                    href={`/parent/child/${link.student_id}/plan`}
                    className="rounded bg-blue-600/20 px-2 py-1 text-blue-300 hover:bg-blue-600/40"
                  >
                    Kế hoạch
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/parent/children"
          className="inline-block rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          Quản lý liên kết →
        </Link>
      </div>
    </div>
  );
}
