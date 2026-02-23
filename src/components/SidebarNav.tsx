"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getUser } from "@/src/lib/auth";
import { STUDENT_NAV, PARENT_NAV, ADMIN_NAV, NavSection } from "@/src/lib/constants/nav";
import { apiFetch } from "@/src/lib/api/client";

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sections, setSections] = useState<NavSection[]>(STUDENT_NAV);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const user = getUser();
    if (user?.role === "parent") setSections(PARENT_NAV);
    else if (user?.role === "admin") setSections(ADMIN_NAV);
    else setSections(STUDENT_NAV);

    // Fetch unread count for student
    if (!user || user.role === "student") {
      apiFetch<{ unread_count: number }>("/student/messages/unread-count")
        .then((data) => setUnreadCount(data.unread_count))
        .catch(() => {/* silently ignore if not logged in */});
    }
  }, []);

  const activePlanView = pathname === "/plan" ? searchParams?.get("view") ?? "week" : undefined;

  return (
    <nav className="flex flex-col gap-4 text-sm">
      {sections.map((section) => {
        const isActive = section.href
          ? section.children
            ? pathname?.startsWith(section.href) ?? false
            : pathname === section.href
          : false;

        const isExchange = section.href === "/exchange";
        const badgeCount = isExchange && unreadCount > 0 ? unreadCount : 0;

        return (
          <div key={section.label} className="space-y-1">
            {section.href ? (
              <Link
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-2 py-1 ${isActive ? "bg-emerald-500/20 text-emerald-200" : "text-zinc-300"}`}
              >
                <span>{section.label}</span>
                {badgeCount > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            ) : (
              <p className="px-2 text-xs uppercase text-zinc-500">{section.label}</p>
            )}
            {section.children && (
              <div className="ml-4 border-l border-zinc-800 pl-3">
                {section.children.map((child) => {
                  const url = new URL(child.href, "https://studyflow.local");
                  const viewParam = url.pathname === "/plan" ? url.searchParams.get("view") : undefined;
                  const childActive = child.href.startsWith("/plan")
                    ? pathname === "/plan" && viewParam === (activePlanView ?? "week")
                    : pathname === url.pathname;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block rounded px-2 py-1 text-xs ${
                        childActive ? "text-emerald-300" : "text-zinc-500"
                      }`}
                      aria-current={childActive ? "page" : undefined}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
