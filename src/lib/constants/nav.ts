export type NavChild = {
  href: string;
  label: string;
};

export type NavSection = {
  href?: string;
  label: string;
  children?: NavChild[];
};

export const STUDENT_NAV: NavSection[] = [
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
  { href: "/library", label: "Thư viện" },
  {
    href: "/exchange",
    label: "Trao đổi",
    children: [
      { href: "/exchange", label: "Hộp thư" },
      { href: "/exchange/assigned-tasks", label: "Nhiệm vụ được giao" },
      { href: "/exchange/assigned-habits", label: "Thói quen được giao" },
    ],
  },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ học tập" }],
  },
  {
    label: "Trợ giúp",
    children: [
      { href: "/guide/quick-start", label: "Bắt đầu nhanh (3 bước)" },
      { href: "/guide/best-practices", label: "Cách dùng tối ưu" },
      { href: "/guide/glossary", label: "Giải thích thuật ngữ" },
      { href: "/guide/faq", label: "Câu hỏi thường gặp" },
    ],
  },
  {
    label: "Khám phá",
    children: [
      { href: "/templates", label: "Kế hoạch mẫu" },
      { href: "/programs", label: "Chương trình học" },
      { href: "/imports/templates", label: "Bản nháp Templates" },
      { href: "/imports/programs", label: "Bản nháp Programs" },
    ],
  },
  { href: "/feedback", label: "Phản hồi" },
];

export const PARENT_NAV: NavSection[] = [
  { href: "/parent", label: "Tổng quan" },
  { href: "/parent/children", label: "Quản lý con em" },
  {
    href: "/parent/track",
    label: "Theo dõi",
    children: [
      { href: "/parent/track?tab=overview", label: "Tổng quan con" },
      { href: "/parent/track?tab=tasks", label: "Nhiệm vụ" },
      { href: "/parent/track?tab=plan", label: "Kế hoạch" },
      { href: "/parent/track?tab=stats", label: "Thống kê" },
    ],
  },
  { href: "/parent/nudges", label: "Nhắc & Gợi ý" },
  { href: "/parent/reports", label: "Báo cáo" },
  {
    href: "/parent/assign",
    label: "Giao nhiệm vụ",
    children: [
      { href: "/parent/assign", label: "Nhiệm vụ" },
      { href: "/parent/assign/habits", label: "Thói quen" },
      { href: "/parent/assign/ideas", label: "Đề xuất" },
      { href: "/parent/assign/messages", label: "Tin nhắn" },
    ],
  },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [
      { href: "/settings/profile", label: "Hồ sơ" },
      { href: "/parent/settings", label: "Khoá cài đặt học sinh" },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/users", label: "Quản lý người dùng" },
  { href: "/admin/library", label: "Thư viện hệ thống" },
  { href: "/demo", label: "Demo/Seed" },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ" }],
  },
];

/** @deprecated Use STUDENT_NAV directly. Kept for backward compatibility. */
export const NAV_SECTIONS: NavSection[] = STUDENT_NAV;
