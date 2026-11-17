/** Single source of truth for TanStack Query keys — enables precise invalidation. */
export const queryKeys = {
  me: ["auth", "me"] as const,
  doctors: {
    all: ["doctors"] as const,
    lists: () => [...queryKeys.doctors.all, "list"] as const,
    list: (params: object) => [...queryKeys.doctors.lists(), params] as const,
    detail: (id: string) => [...queryKeys.doctors.all, "detail", id] as const,
    facets: () => [...queryKeys.doctors.all, "facets"] as const,
    patients: (id: string, params: object) => [...queryKeys.doctors.all, "patients", id, params] as const,
    options: (q: string) => [...queryKeys.doctors.all, "options", q] as const,
  },
  patients: {
    all: ["patients"] as const,
    lists: () => [...queryKeys.patients.all, "list"] as const,
    list: (params: object) => [...queryKeys.patients.lists(), params] as const,
    detail: (id: string) => [...queryKeys.patients.all, "detail", id] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    overview: (params: object) => [...queryKeys.analytics.all, "overview", params] as const,
  },
};
