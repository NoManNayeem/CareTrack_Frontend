"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { analyticsApi, type OverviewParams } from "./api";

export function useOverview(params: OverviewParams) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(params),
    queryFn: ({ signal }) => analyticsApi.overview(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
