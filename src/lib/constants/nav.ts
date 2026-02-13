export type NavChild = {
  href: string;
  label: string;
};

export type NavSection = {
  href?: string;
  label: string;
  children?: NavChild[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Giới thiệu & Hướng dẫn",
    children: [
      { href: "/guide/quick-start", label: "Bắt đầu nhanh (3 bước)" },
      { href: "/guide/best-practices", label: "Cách dùng tối ưu" },
      { href: "/guide/glossary", label: "Giải thích thuật ngữ" },
      { href: "/guide/faq", label: "Câu hỏi thường gặp" },
    ],
  },
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/tasks", label: "Nhiệm vụ" },
  { href: "/free-time", label: "Thời gian rảnh" },
  {
    href: "/plan",
    label: "Kế hoạch",
    children: [
      { href: "/plan?view=year", label: "Năm" },
      { href: "/plan?view=month", label: "Tháng" },
      { href: "/plan?view=week", label: "Tuần" },
      { href: "/plan?view=day", label: "Ngày" },
      { href: "/calendar", label: "Lịch lớn" },
    ],
  },
  { href: "/today", label: "Hôm nay" },
  { href: "/habits", label: "Thói quen" },
  { href: "/stats", label: "Thống kê" },
  { href: "/templates", label: "Kế hoạch mẫu" },
  { href: "/programs", label: "Chương trình học" },
  { href: "/library", label: "Thư viện" },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ học tập" }],
  },
  { href: "/feedback", label: "Phản hồi" },
  { href: "/demo", label: "Demo/Seed" },
];
