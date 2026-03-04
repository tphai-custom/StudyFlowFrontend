"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarNav } from "@/src/components/SidebarNav";
import { getUser, clearAuth, getFullName, ROLE_LABELS, AuthUser } from "@/src/lib/auth";

const AUTH_ROUTES = ["/", "/login", "/register"];

// Routes that require a specific role (prefix-based)
const ADMIN_ROUTES = ["/admin"];
const PARENT_ROUTES = ["/parent"];
// Routes that are student-only (off-limits to parent/admin)
const STUDENT_ONLY_PREFIXES = [
  "/dashboard", "/tasks", "/free-time", "/plan", "/today",
  "/habits", "/stats", "/templates", "/programs", "/imports",
  "/library", "/calendar", "/demo",
];

function getRoleHome(role: string): string {
  if (role === "parent") return "/parent";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setMounted(true);
    const path = pathname ?? "";

    // 1. Not logged in → go to login (except auth pages)
    if (!u && !AUTH_ROUTES.includes(path)) {
      router.replace("/login");
      return;
    }

    if (!u) return;

    // 2. Root → role home
    if (path === "/") {
      router.replace(getRoleHome(u.role));
      return;
    }

    // 3. Admin-only routes — non-admin blocked
    if (ADMIN_ROUTES.some((r) => path.startsWith(r)) && u.role !== "admin") {
      router.replace(getRoleHome(u.role));
      return;
    }

    // 4. Parent-only routes — non-parent blocked
    if (PARENT_ROUTES.some((r) => path.startsWith(r)) && u.role !== "parent") {
      router.replace(getRoleHome(u.role));
      return;
    }

    // 5. Student-only routes — block parent and admin
    if (
      STUDENT_ONLY_PREFIXES.some((r) => path.startsWith(r)) &&
      u.role !== "student"
    ) {
      router.replace(getRoleHome(u.role));
      return;
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const isAuthPage = AUTH_ROUTES.includes(pathname ?? "");

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Block rendering protected pages until:
  // 1. auth state has been read from localStorage (mounted=true), AND
  // 2. a user actually exists (redirect to /login may be in flight but children
  //    must NOT mount before that navigation completes — otherwise child useEffects
  //    fire API calls without a token and get 401/307 cascades).
  if (!mounted || !user) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <span className="mb-6 block text-sm uppercase text-zinc-400">StudyFlow MVP</span>
        </aside>
        <main className="content" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <span className="mb-6 block text-sm uppercase text-zinc-400">StudyFlow MVP</span>
        <SidebarNav />
        <div className="mt-8 rounded-xl bg-surface-muted p-3 text-xs text-zinc-400">
          "Đừng đợi sát deadline mới học" – hãy tạo kế hoạch ngay hôm nay.
        </div>

        {user && (
          <div className="mt-6 border-t border-zinc-800 pt-4 space-y-2">
            <p className="text-sm font-medium text-zinc-200 truncate">{getFullName(user)}</p>
            <p className="text-xs text-zinc-500">@{user.username}</p>
            <span className="inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
              {ROLE_LABELS[user.role]}
            </span>
            <button
              onClick={handleLogout}
              className="mt-2 block w-full rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
