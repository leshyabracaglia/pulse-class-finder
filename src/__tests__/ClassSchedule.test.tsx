import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ClassSchedule from "@/views/Classes/ClassSchedule";
import { useClassesContext } from "@/providers/ClassesProvider";
import { useOrganizationContext } from "@/providers/OrganizationProvider";

vi.mock("@/providers/ClassesProvider", () => ({ useClassesContext: vi.fn() }));
vi.mock("@/providers/OrganizationProvider", () => ({ useOrganizationContext: vi.fn() }));
vi.mock("@/views/Classes/useUserLocation", () => ({
  default: () => ({
    location: { loading: false, latitude: null, error: null },
    requestLocation: vi.fn(),
  }),
}));

const MOCK_CLASSES = [
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
    current_bookings: 0,
  },
];

beforeEach(() => {
  vi.mocked(useClassesContext).mockReturnValue({
    classes: MOCK_CLASSES,
    fetchClasses: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
    bookClass: vi.fn(),
    deleteClass: vi.fn(),
  });
  vi.mocked(useOrganizationContext).mockReturnValue({
    organization: null,
    organizationClasses: null,
  } as any);
});

describe("ClassSchedule", () => {
  it("shows loading state when classes is null", () => {
    vi.mocked(useClassesContext).mockReturnValue({ classes: null } as any);
    render(<ClassSchedule />);
    expect(screen.getByText("Loading classes...")).toBeInTheDocument();
  });

  it("renders all classes initially", () => {
    render(<ClassSchedule />);
    expect(screen.getByText("Morning Yoga")).toBeInTheDocument();
    expect(screen.getByText("HIIT Blast")).toBeInTheDocument();
  });

  it("shows organization name on each class card", () => {
    render(<ClassSchedule />);
    expect(screen.getByText("Sun Studio")).toBeInTheDocument();
    expect(screen.getByText("Power Gym")).toBeInTheDocument();
  });

  it("filters classes by title search", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "yoga" } }
    );
    expect(screen.getByText("Morning Yoga")).toBeInTheDocument();
    expect(screen.queryByText("HIIT Blast")).not.toBeInTheDocument();
  });

  it("filters classes by instructor name", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "bob" } }
    );
    expect(screen.queryByText("Morning Yoga")).not.toBeInTheDocument();
    expect(screen.getByText("HIIT Blast")).toBeInTheDocument();
  });

  it("filters classes by organization name", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "sun studio" } }
    );
    expect(screen.getByText("Morning Yoga")).toBeInTheDocument();
    expect(screen.queryByText("HIIT Blast")).not.toBeInTheDocument();
  });

  it("does not show clear button when no filters are active", () => {
    render(<ClassSchedule />);
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("shows clear button when a search filter is active", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "yoga" } }
    );
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("clears all filters and restores full list when clear is clicked", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "yoga" } }
    );
    expect(screen.queryByText("HIIT Blast")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.getByText("HIIT Blast")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("shows 'No matching classes' with active filter producing no results", () => {
    render(<ClassSchedule />);
    fireEvent.change(
      screen.getByPlaceholderText("Search by class, instructor, or studio..."),
      { target: { value: "pilates" } }
    );
    expect(screen.getByText("No matching classes")).toBeInTheDocument();
    expect(screen.getByText(/try clearing your filters/i)).toBeInTheDocument();
  });

  it("shows 'No upcoming classes' when no classes exist and no filters active", () => {
    vi.mocked(useClassesContext).mockReturnValue({
      classes: [],
      fetchClasses: vi.fn(),
      createClass: vi.fn(),
      updateClass: vi.fn(),
      bookClass: vi.fn(),
      deleteClass: vi.fn(),
    });
    render(<ClassSchedule />);
    expect(screen.getByText("No upcoming classes")).toBeInTheDocument();
  });
});
