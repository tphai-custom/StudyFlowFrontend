"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authLogin } from "@/src/lib/api/auth";
import { saveAuth } from "@/src/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authLogin({ username: form.username.trim(), password: form.password });
      saveAuth(res.access_token, res.user);
      const role = res.user.role;
      if (role === "parent") router.push("/parent");
      else if (role === "admin") router.push("/admin/users");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">StudyFlow</h1>
          <p className="mt-1 text-sm text-zinc-400">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Username</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
              autoComplete="username"
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Mật khẩu</label>
            <input
              type="password"
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-2 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-emerald-400 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
