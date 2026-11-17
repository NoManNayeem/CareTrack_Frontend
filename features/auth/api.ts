import { api } from "@/lib/api-client";
import type { User } from "@/lib/types";
import type { LoginValues } from "@/lib/validation";

export const authApi = {
  login: (body: LoginValues) =>
    api<{ data: { user: User; expiresAt: string } }>("/auth/login", { method: "POST", body }).then((r) => r.data),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  me: (signal?: AbortSignal) => api<{ data: { user: User } }>("/auth/me", { signal }).then((r) => r.data.user),
};
