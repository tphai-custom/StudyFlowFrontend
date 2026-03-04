import { getToken, clearAuth } from "@/src/lib/auth";

// Use relative URL so requests go through the Next.js proxy (next.config.ts rewrites).
// This avoids CORS entirely and works in all environments without env vars.
const BASE_URL = "/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Normalize path: strip trailing slash on collection endpoints to avoid 307 redirects.
  // e.g. "/tasks/" → "/tasks", but "/tasks/abc-123" stays unchanged.
  const normalizedPath = path.replace(/\/+$/, "") || "/";

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Merge caller-provided headers (may override Content-Type)
  if (options?.headers) {
    const extra = options.headers as Record<string, string>;
    for (const [k, v] of Object.entries(extra)) headers[k] = v;
  }
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${normalizedPath}`, {
      ...options,
      headers,
      // Explicit: follow redirects (preserves method + body for 307/308)
      redirect: "follow",
    });
  } catch {
    // Network-level failure (server down, CORS preflight blocked, etc.)
    throw new ApiError(0, "Không thể kết nối tới server. Vui lòng kiểm tra backend đang chạy trên http://localhost:8000.");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");

    // Debug: log details so 404/redirect issues are easy to diagnose
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[apiFetch] ${response.status} ${response.url}\n` +
        `  path="${normalizedPath}" finalURL="${BASE_URL}${normalizedPath}"\n` +
        (response.status === 404
          ? "  ⚠ 404: check that the backend route exists WITHOUT trailing slash, and uvicorn has reloaded."
          : response.status === 307
          ? "  ⚠ 307: trailing slash mismatch — backend redirect_slashes=False requires exact path."
          : `  body: ${text.slice(0, 200)}`)
      );
    }

    if (response.status === 401) {
      // Only clear + redirect when a real token was sent but rejected (expired/revoked).
      // Skip when: no token (ClientShell handles redirect), auth endpoints (wrong password → show form error).
      const isAuthEndpoint = normalizedPath === "/auth/login" || normalizedPath === "/auth/register";
      if (token && !isAuthEndpoint) {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    // Only 401 triggers logout — 307/404/5xx/network errors throw without touching auth.
    throw new ApiError(response.status, `API ${response.status}: ${text}`);
  }
  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const apiDelete = <T = void>(path: string) =>
  apiFetch<T>(path, { method: "DELETE" });
