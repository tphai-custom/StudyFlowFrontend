import { apiFetch } from "./client";
import { AuthUser } from "@/src/lib/auth";

export type LoginPayload = { username: string; password: string };
export type RegisterPayload = {
  username: string;
  password: string;
  role: "student" | "parent" | "admin";
  last_name: string;
  first_name: string;
  date_of_birth?: string;
  address?: string;
  bio?: string;
  hobbies: string[];
};
export type TokenResponse = { access_token: string; token_type: string; user: AuthUser };

export const authLogin = (body: LoginPayload) =>
  apiFetch<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) });

export const authRegister = (body: RegisterPayload) =>
  apiFetch<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const authGetMe = () => apiFetch<AuthUser>("/auth/me");
