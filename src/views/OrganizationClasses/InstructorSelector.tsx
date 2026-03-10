"use client";

import { Button } from "@/components/ui/legacy/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/legacy/dropdown-menu";
import { Plus, User } from "lucide-react";
import { Label } from "@/components/ui/legacy/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/legacy/dialog";
import { Input } from "@/components/ui/Input";

interface IInstructorData {
  instructor_uid: string;
  organization_uid: string;
  name: string;
  email: string;
  phone_number: string;
}

function useOrganizationInstructors() {
  const { organization } = useOrganizationContext();
  const { toast } = useToast();

  const [organizationInstructors, setOrganizationInstructors] =
    useState<IInstructorData[]>();

  const fetchInstructors = async () => {
    if (!organization) return;
    try {
      const res = await fetch(
        `/api/instructors?organization_uid=${organization.organization_uid}`
      );
      if (!res.ok) throw new Error("Failed to fetch instructors");
      const data = await res.json();
      setOrganizationInstructors(data || []);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast({
        title: "Error",
        description: "Failed to load instructors.",
        variant: "destructive",
      });
    }
  };

  const createInstructor = async (instructorData: IInstructorData) => {
    if (!organization || organizationInstructors === undefined) return;

    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_uid: organization.organization_uid,
          name: instructorData.name,
          email: instructorData.email,
          phone_number: instructorData.phone_number,
        }),
      });
      if (!res.ok) throw new Error("Failed to create instructor");
      const created = await res.json();
      setOrganizationInstructors([...organizationInstructors, created]);
      toast({
        title: "Success",
        description: "Instructor created successfully.",
      });
    } catch (error) {
      console.error("Error creating instructor:", error);
      toast({
        title: "Error",
        description: "Failed to create instructor.",
        variant: "destructive",
      });
    }
  };

  return { organizationInstructors, fetchInstructors, createInstructor };
}

function AddInstructorModal({
  open,
  setOpen,
  handleSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleSubmit: (instructorData: IInstructorData) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !phone_number) return;
    handleSubmit({
      instructor_uid: "",
      organization_uid: "",
      name,
      email,
      phone_number,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Instructor</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new instructor to your organization.
        </DialogDescription>
        <form onSubmit={handleSubmitForm}>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Name"
            required
          />
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            label="Email"
            required
          />
          <Input
            id="phone_number"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="tel"
            label="Phone Number"
            required
          />
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name || !email || !phone_number}>
              Add Instructor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InstructorSelector({
  instructorUid,
  updateInstructorUid,
}: {
  instructorUid: string;
  updateInstructorUid: (instructorUid: string) => void;
}) {
  const { organizationInstructors, fetchInstructors, createInstructor } =
    useOrganizationInstructors();

  const [addInstructorModalOpen, setAddInstructorModalOpen] = useState(false);

  useEffect(() => {
    if (organizationInstructors !== undefined) return;
    fetchInstructors();
  }, [fetchInstructors, organizationInstructors]);

  const handleSubmit = (instructorData: IInstructorData) => {
    createInstructor(instructorData);
    setAddInstructorModalOpen(false);
  };

  if (organizationInstructors === undefined) return <div>Loading...</div>;

  return (
    <>
      <div>
        <Label htmlFor="instructor">Instructor</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <User className="w-4 h-4" />
              {instructorUid}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {organizationInstructors.length === 0 && (
              <DropdownMenuItem>
                <User className="w-4 h-4" />
                No instructors found, add one
                <Button onClick={() => setAddInstructorModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Instructor
                </Button>
              </DropdownMenuItem>
            )}
            {organizationInstructors.map((instructor) => (
              <DropdownMenuItem
                key={instructor.instructor_uid}
                onClick={() => updateInstructorUid(instructor.instructor_uid)}
              >
                <User className="w-4 h-4" />
                {instructor.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AddInstructorModal
        open={addInstructorModalOpen}
        setOpen={setAddInstructorModalOpen}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
