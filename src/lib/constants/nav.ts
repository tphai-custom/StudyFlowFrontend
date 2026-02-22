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
  {
    label: "Import & Chỉnh sửa",
    children: [
      { href: "/imports/templates", label: "Draft Templates" },
      { href: "/imports/programs", label: "Draft Programs" },
    ],
  },
  { href: "/library", label: "Thư viện" },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ học tập" }],
  },
  { href: "/feedback", label: "Phản hồi" },
  { href: "/demo", label: "Demo/Seed" },
];

export const PARENT_NAV: NavSection[] = [
  { href: "/parent", label: "Tổng quan" },
  { href: "/parent/children", label: "Liên kết con em" },
  { href: "/parent/suggestions", label: "Gợi ý đã gửi" },
  {
    label: "Giới thiệu & Hướng dẫn",
    children: [
      { href: "/guide", label: "Hướng dẫn phụ huynh" },
      { href: "/guide/parent/link-child", label: "Liên kết con em" },
      { href: "/guide/parent/track-progress", label: "Theo dõi tiến độ" },
      { href: "/guide/parent/assign-tasks", label: "Giao & khoá nhiệm vụ" },
      { href: "/guide/parent/faq", label: "Câu hỏi thường gặp" },
    ],
  },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ" }],
  },
];

export const ADMIN_NAV: NavSection[] = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/users", label: "Quản lý người dùng" },
  { href: "/admin/library", label: "Thư viện hệ thống" },
  {
    href: "/settings",
    label: "Cài đặt",
    children: [{ href: "/settings/profile", label: "Hồ sơ" }],
  },
];

/** @deprecated Use STUDENT_NAV directly. Kept for backward compatibility. */
export const NAV_SECTIONS: NavSection[] = STUDENT_NAV;
