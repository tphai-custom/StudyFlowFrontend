const TOKEN_KEY = "sf_token";
const USER_KEY = "sf_user";

export type UserRole = "student" | "parent" | "admin";

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  last_name: string;
  first_name: string;
  date_of_birth?: string | null;
  address?: string | null;
  bio?: string | null;
  hobbies: string[];
  link_code?: string | null;
  is_active: boolean;
  created_at: string;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Sinh viên",
  parent: "Phụ huynh",
  admin: "Quản trị viên",
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getFullName(user: AuthUser): string {
  return `${user.last_name} ${user.first_name}`.trim();
}
