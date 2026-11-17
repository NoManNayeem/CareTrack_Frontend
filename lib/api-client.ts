import type { FieldIssue } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: FieldIssue[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Field → first message, for mapping server validation onto form fields. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const issue of this.details ?? []) out[issue.field] ??= issue.message;
    return out;
  }
}

type QueryValue = string | number | boolean | Date | null | undefined | Array<string | number>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

const BASE = "/api/v1";

export function toSearchParams(query: Record<string, QueryValue> = {}): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else if (value instanceof Date) {
      params.set(key, value.toISOString().slice(0, 10));
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}

let onUnauthorized: (() => void) | undefined;
/** Registered once by the QueryProvider: clears caches and sends the user to /login. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export async function api<T>(path: string, { method = "GET", body, query, signal }: RequestOptions = {}): Promise<T> {
  const qs = toSearchParams(query).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
    method,
    signal,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const err = payload?.error;
    const apiError = new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.message ?? (res.status >= 500 ? "The server is having trouble. Please try again." : res.statusText),
      err?.details,
    );
    if (res.status === 401 && !path.startsWith("/auth/")) onUnauthorized?.();
    throw apiError;
  }

  return payload as T;
}
