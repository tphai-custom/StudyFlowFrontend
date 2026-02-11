import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarNav } from "@/src/components/SidebarNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyFlow",
  description:
    "Planner thông minh giúp học sinh tránh quên deadline và học dồn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="app-shell">
          <aside className="sidebar">
            <span className="mb-6 block text-sm uppercase text-zinc-400">
              StudyFlow MVP
            </span>
            <SidebarNav />
            <div className="mt-8 rounded-xl bg-surface-muted p-3 text-xs text-zinc-400">
              "Đừng đợi sát deadline mới học" – hãy tạo kế hoạch ngay hôm nay.
            </div>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
