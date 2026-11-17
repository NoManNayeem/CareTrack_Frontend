import { describe, expect, it } from "vitest";
import { pageWindow } from "@/components/data/pagination-bar";
import { ApiError, toSearchParams } from "@/lib/api-client";
import { fromUtcDate, toIsoDay, toUtcDate } from "@/lib/dates";
import { formatCompact, initials, percentChange } from "@/lib/format";
import { patientSchema } from "@/lib/validation";

describe("pageWindow", () => {
  it("shows every page when there are few", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("collapses distant pages into gaps", () => {
    expect(pageWindow(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, "gap", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "gap", 17, 18, 19, 20]);
  });
});

describe("toSearchParams", () => {
  it("drops empty values, joins arrays and formats dates as days", () => {
    const qs = toSearchParams({
      q: "",
      page: 2,
      condition: ["critical", "stable"],
      gender: [],
      from: new Date(Date.UTC(2026, 10, 1)),
      doctor: null,
    }).toString();
    expect(qs).toBe("page=2&condition=critical%2Cstable&from=2026-11-01");
  });
});

describe("dates", () => {
  it("round-trips a local calendar day through UTC without shifting", () => {
    const local = new Date(2026, 0, 31, 23, 30);
    const utc = toUtcDate(local);
    expect(toIsoDay(utc)).toBe("2026-01-31");
    expect(fromUtcDate(utc).getDate()).toBe(31);
  });
});

describe("format", () => {
  it("computes initials without the Dr. prefix", () => {
    expect(initials("Dr. Ayesha Rahman")).toBe("AR");
    expect(initials("Cher")).toBe("C");
  });
  it("compacts only large numbers", () => {
    expect(formatCompact(9_999)).toBe("9,999");
    expect(formatCompact(12_900)).toBe("12.9K");
  });
  it("returns null change when there is no baseline", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(150, 100)).toBe(50);
  });
});

describe("ApiError.fieldErrors", () => {
  it("keeps the first message per field", () => {
    const err = new ApiError(400, "VALIDATION_ERROR", "bad", [
      { location: "body", field: "email", message: "first" },
      { location: "body", field: "email", message: "second" },
    ]);
    expect(err.fieldErrors()).toEqual({ email: "first" });
  });
});

describe("patientSchema", () => {
  const valid = {
    name: "Rafi Ahmed",
    age: 33,
    gender: "male",
    phone: "+880 1711 000000",
    email: "",
    condition: "stable",
    diagnosis: "Migraine",
    admissionDate: new Date(2026, 0, 1),
    notes: "",
  };
  it("accepts a valid patient with an empty optional email", () => {
    expect(patientSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects future admissions and bad phones", () => {
    const res = patientSchema.safeParse({
      ...valid,
      phone: "abc",
      admissionDate: new Date(Date.now() + 86_400_000 * 2),
    });
    expect(res.success).toBe(false);
    const fields = res.error!.issues.map((i) => i.path[0]);
    expect(fields).toContain("phone");
    expect(fields).toContain("admissionDate");
  });
});
