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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/legacy/dialog";
import { Input } from "@/components/ui/Input";
import { useOrganizationInstructors, IInstructorData } from "@/hooks/useOrganizationInstructors";

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
  const [photo_url, setPhotoUrl] = useState("");

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !phone_number) return;
    handleSubmit({
      instructor_uid: "",
      organization_uid: "",
      name,
      email,
      phone_number,
      photo_url: photo_url || null,
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
          <Input
            id="photo_url"
            value={photo_url}
            onChange={(e) => setPhotoUrl(e.target.value)}
            type="url"
            label="Photo URL (optional)"
            placeholder="https://example.com/photo.jpg"
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
  const { instructors, createInstructor } = useOrganizationInstructors();
  const [addInstructorModalOpen, setAddInstructorModalOpen] = useState(false);

  const handleSubmit = (instructorData: IInstructorData) => {
    createInstructor(instructorData);
    setAddInstructorModalOpen(false);
  };

  if (instructors === undefined) return <div>Loading...</div>;

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
            {instructors.length === 0 && (
              <DropdownMenuItem>
                <User className="w-4 h-4" />
                No instructors found, add one
                <Button onClick={() => setAddInstructorModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Instructor
                </Button>
              </DropdownMenuItem>
            )}
            {instructors.map((instructor) => (
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
