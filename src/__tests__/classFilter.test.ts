import { describe, it, expect } from "vitest";
import type { IClassData } from "@/lib/IClassData";

// Replicates the filter logic from ClassSchedule.tsx
function filterClasses(
  classes: IClassData[],
  searchQuery: string,
  filterDate: string
): IClassData[] {
  return classes.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.instructor_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.organization_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || c.class_date === filterDate;
    return matchesSearch && matchesDate;
  });
}

const CLASSES: IClassData[] = [
  {
    id: "1",
    title: "Morning Yoga",
    instructor_uid: "i1",
    instructor_name: "Jane Smith",
    organization_uid: "o1",
    organization_name: "Sun Studio",
    class_date: "2026-03-10",
    class_time: "09:00",
    max_capacity: 10,
    current_bookings: 3,
  },
  {
    id: "2",
    title: "HIIT Blast",
    instructor_uid: "i2",
    instructor_name: "Bob Jones",
    organization_uid: "o2",
    organization_name: "Power Gym",
    class_date: "2026-03-11",
    class_time: "17:00",
    max_capacity: 15,
    current_bookings: 15,
  },
  {
    id: "3",
    title: "Evening Stretch",
    instructor_uid: "i1",
    instructor_name: "Jane Smith",
    organization_uid: "o1",
    organization_name: "Sun Studio",
    class_date: "2026-03-10",
    class_time: "18:00",
    max_capacity: 8,
    current_bookings: 2,
  },
];

describe("filterClasses", () => {
  it("returns all classes with no filters", () => {
    expect(filterClasses(CLASSES, "", "")).toHaveLength(3);
  });

  it("filters by title (case-insensitive)", () => {
    expect(filterClasses(CLASSES, "yoga", "")).toHaveLength(1);
    expect(filterClasses(CLASSES, "YOGA", "")).toHaveLength(1);
    expect(filterClasses(CLASSES, "blast", "")).toHaveLength(1);
  });

  it("filters by instructor name", () => {
    expect(filterClasses(CLASSES, "jane", "")).toHaveLength(2);
    expect(filterClasses(CLASSES, "bob", "")).toHaveLength(1);
    expect(filterClasses(CLASSES, "JANE", "")).toHaveLength(2);
  });

  it("filters by organization name", () => {
    expect(filterClasses(CLASSES, "sun studio", "")).toHaveLength(2);
    expect(filterClasses(CLASSES, "power", "")).toHaveLength(1);
    expect(filterClasses(CLASSES, "gym", "")).toHaveLength(1);
  });

  it("filters by exact date", () => {
    expect(filterClasses(CLASSES, "", "2026-03-10")).toHaveLength(2);
    expect(filterClasses(CLASSES, "", "2026-03-11")).toHaveLength(1);
    expect(filterClasses(CLASSES, "", "2026-03-12")).toHaveLength(0);
  });

  it("applies search and date as AND filters", () => {
    // Bob has no classes on 2026-03-10
    expect(filterClasses(CLASSES, "bob", "2026-03-10")).toHaveLength(0);
    // Bob has 1 class on 2026-03-11
    expect(filterClasses(CLASSES, "bob", "2026-03-11")).toHaveLength(1);
    // Jane has 2 classes on 2026-03-10
    expect(filterClasses(CLASSES, "jane", "2026-03-10")).toHaveLength(2);
  });

  it("returns empty array when no classes match", () => {
    expect(filterClasses(CLASSES, "pilates", "")).toHaveLength(0);
    expect(filterClasses(CLASSES, "", "2099-01-01")).toHaveLength(0);
    expect(filterClasses(CLASSES, "yoga", "2026-03-11")).toHaveLength(0);
  });

  it("handles classes with missing instructor_name or organization_name", () => {
    const sparse: IClassData[] = [
      {
        id: "x",
        title: "Bare Class",
        instructor_uid: "ix",
        organization_uid: "ox",
        class_date: "2026-03-10",
        class_time: "10:00",
        max_capacity: 5,
        current_bookings: 0,
      },
    ];
    // Should not throw and should match on title
    expect(filterClasses(sparse, "bare", "")).toHaveLength(1);
    // Should not match instructor/org search (undefined treated as "")
    expect(filterClasses(sparse, "john", "")).toHaveLength(0);
  });
});
