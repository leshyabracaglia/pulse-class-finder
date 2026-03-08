import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import OrganizationClassesDisplay from "@/pages/OrganizationClasses/OrganizationClassesDisplay";
import { useClassesContext } from "@/providers/ClassesProvider";
import { useOrganizationContext } from "@/providers/OrganizationProvider";

vi.mock("@/providers/ClassesProvider", () => ({ useClassesContext: vi.fn() }));
vi.mock("@/providers/OrganizationProvider", () => ({ useOrganizationContext: vi.fn() }));
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/pages/OrganizationClasses/InstructorSelector", () => ({
  default: ({ instructorUid }: { instructorUid: string }) => (
    <div data-testid="instructor-selector">{instructorUid}</div>
  ),
}));
vi.mock("@/pages/OrganizationClasses/AttendanceView", () => ({
  default: ({ open, classTitle }: { open: boolean; classTitle: string }) =>
    open ? <div data-testid="attendance-dialog">Attendance for {classTitle}</div> : null,
}));

const mockOrg = { organization_uid: "org-1", name: "Test Studio" };
const mockClasses = [
  {
    id: "c1",
    title: "Morning Yoga",
    instructor_uid: "i1",
    organization_uid: "org-1",
    class_date: "2026-03-10",
    class_time: "09:00",
    max_capacity: 10,
    current_bookings: 3,
  },
  {
    id: "c2",
    title: "HIIT Blast",
    instructor_uid: "i1",
    organization_uid: "org-1",
    class_date: "2026-03-11",
    class_time: "17:00",
    max_capacity: 15,
    current_bookings: 5,
  },
];

let mockCreateClass: ReturnType<typeof vi.fn>;
let mockUpdateClass: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockCreateClass = vi.fn().mockResolvedValue(true);
  mockUpdateClass = vi.fn().mockResolvedValue(true);
  vi.mocked(useClassesContext).mockReturnValue({
    classes: mockClasses,
    fetchClasses: vi.fn(),
    createClass: mockCreateClass,
    updateClass: mockUpdateClass,
    bookClass: vi.fn(),
    deleteClass: vi.fn().mockResolvedValue(true),
  });
  vi.mocked(useOrganizationContext).mockReturnValue({
    organization: mockOrg,
    organizationClasses: mockClasses,
  } as any);
});

describe("OrganizationClassesDisplay — Add Class", () => {
  it("shows form with empty title when Add Class is clicked", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getByRole("button", { name: /add class/i }));
    expect(screen.getByText("Add New Class")).toBeInTheDocument();
    expect(screen.getByLabelText(/class title/i)).toHaveValue("");
  });

  it("calls createClass (not updateClass) when submitting a new class", async () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getByRole("button", { name: /add class/i }));

    fireEvent.change(screen.getByLabelText(/class title/i), {
      target: { value: "Power Flow" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2026-04-01" },
    });
    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/max capacity/i), {
      target: { value: "20" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create class/i }));

    await waitFor(() => {
      expect(mockCreateClass).toHaveBeenCalledTimes(1);
      expect(mockUpdateClass).not.toHaveBeenCalled();
    });
  });

  it("closes form after successful create", async () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getByRole("button", { name: /add class/i }));
    expect(screen.getByText("Add New Class")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByText("Add New Class")).not.toBeInTheDocument();
  });
});

describe("OrganizationClassesDisplay — Edit Class", () => {
  it("shows 'Edit Class' heading when Edit is clicked", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);
    expect(screen.getByText("Edit Class")).toBeInTheDocument();
  });

  it("populates form with the class's existing data", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);
    expect(screen.getByLabelText(/class title/i)).toHaveValue("Morning Yoga");
    expect(screen.getByLabelText(/date/i)).toHaveValue("2026-03-10");
    expect(screen.getByLabelText(/time/i)).toHaveValue("09:00");
    expect(screen.getByLabelText(/max capacity/i)).toHaveValue(10);
  });

  it("re-seeds form when switching to a different class", () => {
    render(<OrganizationClassesDisplay />);
    const editButtons = screen.getAllByLabelText("Edit class");

    fireEvent.click(editButtons[0]);
    expect(screen.getByLabelText(/class title/i)).toHaveValue("Morning Yoga");

    fireEvent.click(editButtons[1]);
    expect(screen.getByLabelText(/class title/i)).toHaveValue("HIIT Blast");
  });

  it("shows empty form when Add Class is clicked after editing", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);
    expect(screen.getByLabelText(/class title/i)).toHaveValue("Morning Yoga");

    // Close form then open fresh
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /add class/i })[0]);
    expect(screen.getByLabelText(/class title/i)).toHaveValue("");
  });

  it("calls updateClass (not createClass) when submitting an edit", async () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);

    fireEvent.click(screen.getByRole("button", { name: /update class/i }));

    await waitFor(() => {
      expect(mockUpdateClass).toHaveBeenCalledTimes(1);
      expect(mockCreateClass).not.toHaveBeenCalled();
    });
  });

  it("calls updateClass with the updated title", async () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);

    fireEvent.change(screen.getByLabelText(/class title/i), {
      target: { value: "Afternoon Yoga" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update class/i }));

    await waitFor(() => {
      expect(mockUpdateClass).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Afternoon Yoga", id: "c1" })
      );
    });
  });

  it("closes form after successful update", async () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("Edit class")[0]);
    expect(screen.getByText("Edit Class")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update class/i }));

    await waitFor(() => {
      expect(screen.queryByText("Edit Class")).not.toBeInTheDocument();
    });
  });
});

describe("OrganizationClassesDisplay — Attendance View", () => {
  it("opens attendance dialog when View Bookings is clicked", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("View bookings")[0]);
    expect(screen.getByTestId("attendance-dialog")).toBeInTheDocument();
    expect(screen.getByText("Attendance for Morning Yoga")).toBeInTheDocument();
  });

  it("opens attendance dialog for the correct class", () => {
    render(<OrganizationClassesDisplay />);
    fireEvent.click(screen.getAllByLabelText("View bookings")[1]);
    expect(screen.getByText("Attendance for HIIT Blast")).toBeInTheDocument();
  });
});
