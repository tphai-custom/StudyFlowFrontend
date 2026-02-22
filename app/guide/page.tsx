"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, UserRole } from "@/src/lib/auth";

const STUDENT_SECTIONS = [
  {
    href: "/guide/quick-start",
    icon: "🚀",
    title: "Bắt đầu nhanh (3 bước)",
    desc: "Hướng dẫn nhanh 3 bước để tạo kế hoạch học đầu tiên ngay lập tức",
  },
  {
    href: "/guide/best-practices",
    icon: "💡",
    title: "Cách dùng tối ưu",
    desc: "Mẹo và chiến lược sử dụng StudyFlow hiệu quả nhất, kể cả phím tắt",
  },
  {
    href: "/guide/library-tips",
    icon: "📚",
    title: "Dùng Thư viện hiệu quả",
    desc: "Chọn môn/lớp, tìm tài liệu hay và tạo nhiệm vụ trực tiếp từ thư viện",
  },
  {
    href: "/guide/glossary",
    icon: "📖",
    title: "Giải thích thuật ngữ",
    desc: "Ý nghĩa của Deep work, Buffer, Milestone, Template và các khái niệm khác",
  },
  {
    href: "/guide/faq",
    icon: "❓",
    title: "Câu hỏi thường gặp",
    desc: "Giải đáp: không xếp được lịch, điểm khả thi thấp, Hôm nay trống...",
  },
];

const PARENT_SECTIONS = [
  {
    href: "/guide/parent/link-child",
    icon: "🔗",
    title: "Bắt đầu: Liên kết con",
    desc: "Cách nhập username và mã liên kết để theo dõi tài khoản học sinh",
  },
  {
    href: "/guide/parent/track-progress",
    icon: "📊",
    title: "Theo dõi kế hoạch & tiến độ",
    desc: "Xem nhiệm vụ, kế hoạch tuần/ngày và thống kê học tập của con",
  },
  {
    href: "/guide/parent/assign-tasks",
    icon: "📝",
    title: "Giao nhiệm vụ & khóa nhiệm vụ",
    desc: "Phụ huynh giao nhiệm vụ cho con – học sinh không thể tự xóa",
  },
  {
    href: "/guide/parent/account-controls",
    icon: "🔒",
    title: "Quản lý tài khoản, giới hạn học",
    desc: "Khóa/mở tài khoản và thiết lập giới hạn học tập hàng ngày",
  },
  {
    href: "/guide/parent/faq",
    icon: "❓",
    title: "FAQ phụ huynh",
    desc: "Những câu hỏi thường gặp dành riêng cho phụ huynh",
  },
];

export default function GuidePage() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const u = getUser();
    setRole(u?.role ?? null);
  }, []);

  const isParent = role === "parent";
  const sections = isParent ? PARENT_SECTIONS : STUDENT_SECTIONS;
  const roleLabel = isParent ? "Phụ huynh" : "Học sinh";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase text-zinc-400">Giới thiệu</p>
        <h1 className="text-3xl font-semibold">Giới thiệu & Hướng dẫn</h1>
        <p className="text-sm text-zinc-400">
          Tìm hiểu cách dùng StudyFlow hiệu quả để lập kế hoạch học tập hợp lý
        </p>
        {role && (
          <span className="mt-2 inline-block rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
            Đang xem: Nội dung dành cho {roleLabel}
          </span>
        )}
      </header>

      {/* Role switcher (for preview) */}
      {role && (
        <div className="flex gap-2">
          <button
            className={`rounded-lg px-3 py-1 text-sm ${!isParent ? "bg-emerald-500 text-black" : "border border-zinc-600 text-zinc-400"}`}
            onClick={() => setRole("student")}
          >
            Học sinh
          </button>
          <button
            className={`rounded-lg px-3 py-1 text-sm ${isParent ? "bg-blue-500 text-white" : "border border-zinc-600 text-zinc-400"}`}
            onClick={() => setRole("parent")}
          >
            Phụ huynh
          </button>
        </div>
      )}

      <div className="grid-auto">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
                <p className="text-sm text-zinc-400">{s.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
