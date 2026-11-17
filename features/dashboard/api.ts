import { api } from "@/lib/api-client";
import type { Overview } from "@/lib/types";

export interface OverviewParams {
  from: string;
  to: string;
}

export const analyticsApi = {
  overview: (params: OverviewParams, signal?: AbortSignal) =>
    api<{ data: Overview }>("/analytics/overview", { query: { ...params }, signal }).then((r) => r.data),
};
