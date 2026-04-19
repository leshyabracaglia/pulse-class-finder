"use client";

import { useCallback, useEffect, useState } from "react";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import { useToast } from "@/hooks/useToast";

export interface IInstructorData {
  instructor_uid: string;
  organization_uid: string;
  name: string;
  email: string;
  phone_number: string;
  photo_url?: string | null;
}

export function useOrganizationInstructors() {
  const { organization } = useOrganizationContext();
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<IInstructorData[] | undefined>();

  const fetchInstructors = useCallback(async () => {
    if (!organization) return;
    try {
      const res = await fetch(`/api/instructors?organization_uid=${organization.organization_uid}`);
      if (!res.ok) throw new Error("Failed to fetch instructors");
      const data = await res.json();
      setInstructors(data || []);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast({ title: "Error", description: "Failed to load instructors.", variant: "destructive" });
    }
  }, [organization, toast]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const createInstructor = useCallback(async (instructorData: IInstructorData) => {
    if (!organization || instructors === undefined) return;
    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_uid: organization.organization_uid,
          name: instructorData.name,
          email: instructorData.email,
          phone_number: instructorData.phone_number,
          photo_url: instructorData.photo_url || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create instructor");
      const created = await res.json();
      setInstructors([...instructors, created]);
      toast({ title: "Success", description: "Instructor created successfully." });
    } catch (error) {
      console.error("Error creating instructor:", error);
      toast({ title: "Error", description: "Failed to create instructor.", variant: "destructive" });
    }
  }, [organization, instructors, toast]);

  return { instructors, createInstructor };
}
