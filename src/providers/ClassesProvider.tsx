import React, { createContext, useCallback, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/useToast";
import { IClassData } from "@/lib/IClassData";

// TODO: argh these frontend variables should be camelCase
interface ICreateClassData {
  title: string;
  class_time: string;
  class_date: string;
  max_capacity: number;
  instructor_uid: string;
}

interface IClassesContext {
  classes: IClassData[] | null;
  fetchClasses: () => void;
  createClass: ({
    title,
    class_time,
    class_date,
    max_capacity,
    instructor_uid,
  }: ICreateClassData) => Promise<boolean>;
}

const ClassesContext = createContext<IClassesContext | undefined>(undefined);

export default function ClassesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [classes, setClasses] = useState<IClassData[]>();

  const fetchClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(
          "id, title, class_time, class_date, max_capacity, instructor_uid, organization_uid"
        );

      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive",
        });
        return;
      }
      setClasses(data);
      return data;
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
      return;
    }
  }, []);

  async function createClass({
    title,
    class_time,
    class_date,
    max_capacity,
    instructor_uid,
    organization_uid,
  }: {
    title: string;
    class_time: string;
    class_date: string;
    max_capacity: number;
    instructor_uid: string;
    organization_uid: string;
  }) {
    if (!organization_uid) {
      toast({
        title: "Error",
        description: "Organization not found.",
        variant: "destructive",
      });
      return false;
    }

    const classId = crypto.randomUUID();

    const { error: classError } = await supabase.from("classes").insert({
      id: classId,
      organization_uid: organization_uid,
      class_date: class_date,
      class_time: class_time,
      instructor_uid: instructor_uid,
      max_capacity: max_capacity,
      title: title,
    });

    if (classError) {
      toast({
        title: "Error",
        description: "Failed to create class.",
        variant: "destructive",
      });
      return false;
    }

    setClasses([
      ...classes,
      {
        id: classId,
        organization_uid: organization_uid,
        title: title,
        class_time: class_time,
        class_date: class_date,
        max_capacity: max_capacity,
        instructor_uid: instructor_uid,
      },
    ]);
    return true;
  }

  return (
    <ClassesContext.Provider
      value={{
        classes,
        fetchClasses,
        createClass,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
}

export function useClassesContext() {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error("useClassesContext must be used within an ClassesProvider");
  }
  return context;
}
