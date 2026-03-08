import React, { createContext, useCallback, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/useToast";
import { IClassData } from "@/lib/IClassData";
import { useAuthContext } from "./AuthProvider";

interface ICreateClassData {
  title: string;
  class_time: string;
  class_date: string;
  max_capacity: number;
  instructor_uid: string;
  organization_uid: string;
}

interface IClassesContext {
  classes: IClassData[] | null;
  fetchClasses: () => void;
  createClass: (data: ICreateClassData) => Promise<boolean>;
  updateClass: (data: IClassData) => Promise<boolean>;
  bookClass: (classId: string) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
}

const ClassesContext = createContext<IClassesContext | undefined>(undefined);

export default function ClassesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [classes, setClasses] = useState<IClassData[] | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const [
        { data: classesData, error },
        { data: bookingsData },
        { data: instructorsData },
        { data: orgsData },
      ] = await Promise.all([
        supabase
          .from("classes")
          .select(
            "id, title, class_time, class_date, max_capacity, instructor_uid, organization_uid"
          ),
        supabase
          .from("bookings")
          .select("class_id")
          .eq("booking_status", "confirmed"),
        supabase
          .from("organization_instructors")
          .select("instructor_uid, name"),
        supabase
          .from("organizations")
          .select("organization_uid, name"),
      ]);

      if (error || !classesData) {
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive",
        });
        return;
      }

      const countMap: Record<string, number> = {};
      bookingsData?.forEach((b) => {
        countMap[b.class_id] = (countMap[b.class_id] || 0) + 1;
      });

      const instructorMap: Record<string, string> = {};
      instructorsData?.forEach((i) => {
        instructorMap[i.instructor_uid] = i.name;
      });

      const orgMap: Record<string, string> = {};
      orgsData?.forEach((o) => {
        orgMap[o.organization_uid] = o.name;
      });

      setClasses(
        classesData.map((c) => ({
          ...c,
          current_bookings: countMap[c.id] || 0,
          instructor_name: instructorMap[c.instructor_uid],
          organization_name: orgMap[c.organization_uid],
        }))
      );
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    }
  }, []);

  async function createClass({
    title,
    class_time,
    class_date,
    max_capacity,
    instructor_uid,
    organization_uid,
  }: ICreateClassData) {
    if (!organization_uid) {
      toast({
        title: "Error",
        description: "Organization not found.",
        variant: "destructive",
      });
      return false;
    }

    const classId = crypto.randomUUID();
    const { error } = await supabase.from("classes").insert({
      id: classId,
      organization_uid,
      class_date,
      class_time,
      instructor_uid,
      max_capacity,
      title,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create class.",
        variant: "destructive",
      });
      return false;
    }

    setClasses((prev) => [
      ...(prev || []),
      {
        id: classId,
        organization_uid,
        title,
        class_time,
        class_date,
        max_capacity,
        instructor_uid,
        current_bookings: 0,
      },
    ]);
    return true;
  }

  async function updateClass(data: IClassData): Promise<boolean> {
    const { error } = await supabase
      .from("classes")
      .update({
        title: data.title,
        class_time: data.class_time,
        class_date: data.class_date,
        max_capacity: data.max_capacity,
        instructor_uid: data.instructor_uid,
      })
      .eq("id", data.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update class.",
        variant: "destructive",
      });
      return false;
    }

    setClasses((prev) =>
      prev?.map((c) => (c.id === data.id ? { ...c, ...data } : c)) || null
    );
    return true;
  }

  async function bookClass(classId: string): Promise<boolean> {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to book a class.",
        variant: "destructive",
      });
      return false;
    }

    const classItem = classes?.find((c) => c.id === classId);
    if (!classItem) return false;

    if (classItem.current_bookings >= classItem.max_capacity) {
      toast({
        title: "Class full",
        description: "This class is already at capacity.",
        variant: "destructive",
      });
      return false;
    }

    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("class_id", classId)
      .eq("user_id", user.id)
      .eq("booking_status", "confirmed")
      .maybeSingle();

    if (existing) {
      toast({
        title: "Already booked",
        description: "You've already booked this class.",
      });
      return false;
    }

    const { error } = await supabase.from("bookings").insert({
      class_id: classId,
      user_id: user.id,
      booking_status: "confirmed",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book class.",
        variant: "destructive",
      });
      return false;
    }

    setClasses(
      (prev) =>
        prev?.map((c) =>
          c.id === classId
            ? { ...c, current_bookings: c.current_bookings + 1 }
            : c
        ) || null
    );

    toast({
      title: "Booked!",
      description: `You've successfully booked ${classItem.title}.`,
    });
    return true;
  }

  async function deleteClass(classId: string): Promise<boolean> {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
      return false;
    }

    setClasses((prev) => prev?.filter((c) => c.id !== classId) || null);
    return true;
  }

  return (
    <ClassesContext.Provider
      value={{
        classes,
        fetchClasses,
        createClass,
        updateClass,
        bookClass,
        deleteClass,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
}

export function useClassesContext() {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error("useClassesContext must be used within a ClassesProvider");
  }
  return context;
}
