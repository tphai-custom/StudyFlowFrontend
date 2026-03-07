"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/src/lib/auth";

function getRoleHome(role: string): string {
  if (role === "parent") return "/parent";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

const FEATURES = [
  {
    icon: "⏱️",
    title: "Nhập thời gian rảnh",
    desc: "Bạn chỉ học trong slot rảnh. Hết slot → hệ thống báo thiếu.",
  },
  {
    icon: "📋",
    title: "Tạo nhiệm vụ có deadline",
    desc: "Môn học, độ khó, ước lượng thời gian, checklist tiêu chí hoàn thành — đủ dữ liệu để chia lịch.",
  },
  {
    icon: "🗓️",
    title: "Tạo kế hoạch tự động",
    desc: "Tự chia nhỏ thành phiên học Pomodoro/Deep work và giờ nghỉ chống nhồi lịch.",
  },
  {
    icon: "✅",
    title: "Hôm nay cần làm gì",
    desc: "Danh sách phiên học hôm nay. Tick xong để cập nhật tiến độ tức thì.",
  },
  {
    icon: "📊",
    title: "Thống kê & báo cáo",
    desc: "Phút học theo tuần/tháng, môn học nhiều nhất, xuất báo cáo nhanh.",
  },
  {
    icon: "📚",
    title: "Template & Chương trình",
    desc: "Import nhanh template học kỳ hoặc chương trình có sẵn — không cần nhập từ đầu.",
  },
  {
    icon: "💬",
    title: "Trao đổi phụ huynh – học sinh",
    desc: "Phụ huynh giao nhiệm vụ / thói quen, học sinh phản hồi 1 chạm và báo tiến độ. Nhiệm vụ bắt buộc tự động vào kế hoạch.",
  },
];

const PERSONAS = [
  {
    icon: "🎓",
    role: "Học sinh",
    desc: "Muốn học đều, tránh quên deadline và không phải học nhồi vài ngày trước khi thi.",
  },
  {
    icon: "👨‍👩‍👧",
    role: "Phụ huynh",
    desc: "Theo dõi tiến độ học tập, giao thói quen và nhiệm vụ, gửi nhắc nhở cho con.",
  },
  {
    icon: "🧑‍🏫",
    role: "Giáo viên / Mentor",
    desc: "Xem báo cáo nhanh, gợi ý kế hoạch học, hỗ trợ học sinh theo dõi mục tiêu.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace(getRoleHome(user.role));
    }
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: "rgba(5,5,5,0.85)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            STUDYFLOW MVP
          </span>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Tạo tài khoản
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-24 px-6 py-20">
        {/* ── B2: Hero ── */}
        <section className="space-y-8 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-100 sm:text-5xl">
            StudyFlow — Lập kế hoạch học{" "}
            <span className="text-emerald-400">"khả thi"</span>
            <br className="hidden sm:block" />
            {" "}theo thời gian rảnh
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
            Nhập thời gian rảnh + nhiệm vụ + deadline → hệ thống tự chia nhỏ và xếp lịch học hợp lý.
          </p>

          {/* 3 chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
              ✅ Không xếp lịch "ảo" — báo nếu hết slot
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
              ✅ Chia task lớn thành milestone + phiên học
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
              ✅ Theo dõi tiến độ &amp; xuất báo cáo
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-500 px-10 py-3.5 text-base font-bold text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              🟩 Đăng nhập để bắt đầu
            </Link>
            <p className="text-sm text-zinc-500">Mất ~3 phút để tạo kế hoạch đầu tiên.</p>
            <Link href="/register" className="text-sm text-emerald-400 hover:underline">
              Chưa có tài khoản? Tạo miễn phí →
            </Link>
          </div>
        </section>

        {/* ── B3: Tính năng chính ── */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-100">Tính năng chính</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border p-5 space-y-3 transition-colors hover:border-zinc-600"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-2xl">{f.icon}</span>
                <p className="font-semibold text-zinc-100">{f.title}</p>
                <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── B4: Vì sao nên dùng ── */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-100">Vì sao nên dùng?</h2>
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="grid gap-8 sm:grid-cols-2">
              {/* Cách làm cũ */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Cách làm cũ
                </p>
                <ul className="space-y-2.5 text-sm text-zinc-400">
                  {[
                    "To-do list dài, không biết học lúc nào",
                    "Lên plan đẹp nhưng không khớp thời gian rảnh",
                    "Deadline tới mới cuống học",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-red-400">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* StudyFlow */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  StudyFlow
                </p>
                <ul className="space-y-2.5 text-sm text-zinc-300">
                  {[
                    "Lịch học theo slot rảnh",
                    "Task được chia nhỏ thành milestone + phiên học",
                    "Theo dõi tuần + cảnh báo sớm trước deadline",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── B5: Dành cho ai? ── */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-100">Dành cho ai?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PERSONAS.map((p) => (
              <div
                key={p.role}
                className="rounded-xl border p-5 space-y-3 text-center"
                style={{ background: "var(--surface-muted)", borderColor: "var(--border)" }}
              >
                <div className="text-4xl">{p.icon}</div>
                <p className="font-semibold text-zinc-100">{p.role}</p>
                <p className="text-sm leading-relaxed text-zinc-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── B6: Quy trình 3 bước ── */}
        <section
          className="rounded-2xl border p-8 space-y-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-center text-2xl font-bold text-zinc-100">
            Bắt đầu trong 3 bước
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: "⏱️",
                title: "Nhập thời gian rảnh",
                desc: "Khai báo các slot rảnh trong tuần — môn học sẽ chỉ được xếp vào đây.",
              },
              {
                step: "2",
                icon: "📋",
                title: "Tạo nhiệm vụ học tập",
                desc: "Thêm task với deadline, môn, và ước tính giờ cần học.",
              },
              {
                step: "3",
                icon: "🗓️",
                title: "Tạo kế hoạch",
                desc: "Một cú click — hệ thống tự chia và xếp phiên học hợp lý.",
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-xl border border-zinc-700/60 bg-zinc-900 p-5 space-y-2 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-black">
                  Bước {s.step}
                </span>
                <div className="pt-2 text-3xl">{s.icon}</div>
                <p className="font-semibold text-zinc-100">{s.title}</p>
                <p className="text-sm leading-relaxed text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-500 px-10 py-3.5 text-base font-bold text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Đăng nhập để làm ngay
            </Link>
            <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Chưa có tài khoản → Tạo miễn phí
            </Link>
          </div>
        </section>

        {/* ── B7: Footer ── */}
        <footer className="border-t pb-8 pt-8 text-center space-y-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold text-zinc-400">StudyFlow MVP</p>
          <p className="text-xs text-zinc-600">
            Dữ liệu học tập chỉ hiển thị sau khi đăng nhập.
          </p>
          <div className="flex justify-center gap-6 text-xs text-zinc-600">
            <Link href="/guide/quick-start" className="hover:text-zinc-400 transition-colors">
              Hướng dẫn
            </Link>
            <Link href="/guide/faq" className="hover:text-zinc-400 transition-colors">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">
              Đăng nhập
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
