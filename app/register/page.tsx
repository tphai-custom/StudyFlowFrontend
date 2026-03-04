"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/src/lib/api/auth";
import { saveAuth, ROLE_LABELS } from "@/src/lib/auth";
import DateInput from "@/src/components/DateInput";

type Role = "student" | "parent";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm_password: "",
    role: "student" as Role,
    last_name: "",
    first_name: "",
    date_of_birth: "",
    address: "",
    bio: "",
    hobbies_raw: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const hobbies = form.hobbies_raw
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      const res = await authRegister({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        last_name: form.last_name.trim(),
        first_name: form.first_name.trim(),
        date_of_birth: form.date_of_birth || undefined,
        address: form.address.trim() || undefined,
        bio: form.bio.trim() || undefined,
        hobbies,
      });
      saveAuth(res.access_token, res.user);
      const role = res.user.role;
      if (role === "parent") {
        router.push("/parent");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">StudyFlow</h1>
          <p className="mt-1 text-sm text-zinc-400">Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {/* Role */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Loại tài khoản*</label>
            <div className="flex gap-3">
              {(["student", "parent"] as Role[]).map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => field("role", r)}
                    className="accent-emerald-500"
                  />
                  {ROLE_LABELS[r]}
                </label>
              ))}
            </div>
          </div>

          {/* Name row */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-sm text-zinc-300">Họ*</label>
              <input
                className="rounded-lg border border-zinc-700 bg-transparent p-2"
                value={form.last_name}
                onChange={(e) => field("last_name", e.target.value)}
                placeholder="Nguyễn"
                required
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm text-zinc-300">Tên*</label>
              <input
                className="rounded-lg border border-zinc-700 bg-transparent p-2"
                value={form.first_name}
                onChange={(e) => field("first_name", e.target.value)}
                placeholder="Văn A"
                required
              />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Username*</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.username}
              onChange={(e) => field("username", e.target.value)}
              placeholder="Không chứa khoảng trắng"
              autoComplete="username"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-sm text-zinc-300">Mật khẩu* (≥6 ký tự)</label>
              <input
                type="password"
                className="rounded-lg border border-zinc-700 bg-transparent p-2"
                value={form.password}
                onChange={(e) => field("password", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm text-zinc-300">Xác nhận mật khẩu*</label>
              <input
                type="password"
                className="rounded-lg border border-zinc-700 bg-transparent p-2"
                value={form.confirm_password}
                onChange={(e) => field("confirm_password", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Extra info */}
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Ngày sinh</label>
            <DateInput
              className="w-full rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.date_of_birth}
              onChange={(iso) => field("date_of_birth", iso)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Địa chỉ</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.address}
              onChange={(e) => field("address", e.target.value)}
              placeholder="Thành phố, tỉnh..."
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Mô tả bản thân</label>
            <textarea
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              rows={2}
              value={form.bio}
              onChange={(e) => field("bio", e.target.value)}
              placeholder="Vài dòng về bạn..."
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-zinc-300">Sở thích (cách nhau bằng dấu phẩy)</label>
            <input
              className="rounded-lg border border-zinc-700 bg-transparent p-2"
              value={form.hobbies_raw}
              onChange={(e) => field("hobbies_raw", e.target.value)}
              placeholder="Đọc sách, Gaming, Âm nhạc"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-2 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
