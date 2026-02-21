"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getUser } from "@/src/lib/auth";
import { STUDENT_NAV, PARENT_NAV, ADMIN_NAV, NavSection } from "@/src/lib/constants/nav";

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sections, setSections] = useState<NavSection[]>(STUDENT_NAV);

  useEffect(() => {
    const user = getUser();
    if (user?.role === "parent") setSections(PARENT_NAV);
    else if (user?.role === "admin") setSections(ADMIN_NAV);
    else setSections(STUDENT_NAV);
  }, []);

  const activePlanView = pathname === "/plan" ? searchParams?.get("view") ?? "week" : undefined;

  return (
    <nav className="flex flex-col gap-4 text-sm">
      {sections.map((section) => {
        const isActive = section.href ? pathname?.startsWith(section.href) : false;
        return (
          <div key={section.label} className="space-y-1">
            {section.href ? (
              <Link
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-lg px-2 py-1 ${isActive ? "bg-emerald-500/20 text-emerald-200" : "text-zinc-300"}`}
              >
                {section.label}
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
