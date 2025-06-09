
import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";

export interface ClassData {
  id: string;
  title: string;
  instructor: string;
  class_time: string;
  class_date: string;
  duration_minutes: number;
  difficulty: string;
  class_type: string;
  max_capacity: number;
  current_bookings: number;
  companies?: {
    company_name: string;
    address: string;
  };
}

export default function useUserClasses() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassData[]>();

  const fetchClasses = async () => {
    console.log("fetchClasses called, user:", user);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          companies (
            company_name,
            address
          )
        `
        )
        .gte("class_date", new Date().toISOString().split("T")[0])
        .order("class_date", { ascending: true })
        .order("class_time", { ascending: true });

      console.log("Classes query result:", { data, error });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    }
  };

  const bookClass = async (classId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a class.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if class is already full
      const classToBook = classes.find((c) => c.id === classId);
      if (
        classToBook &&
        classToBook.current_bookings >= classToBook.max_capacity
      ) {
        toast({
          title: "Class Full",
          description: "This class is already at capacity.",
          variant: "destructive",
        });
        return;
      }

      // Check if user already booked this class
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .eq("booking_status", "confirmed")
        .single();

      if (existingBooking) {
        toast({
          title: "Already Booked",
          description: "You have already booked this class.",
          variant: "destructive",
        });
        return;
      }

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: user.id,
        class_id: classId,
        booking_status: "confirmed",
      });

      if (bookingError) throw bookingError;

      // Update current_bookings count
      const { error: updateError } = await supabase
        .from("classes")
        .update({
          current_bookings: (classToBook?.current_bookings || 0) + 1,
        })
        .eq("id", classId);

      if (updateError)
        console.error("Error updating class capacity:", updateError);

      toast({
        title: "Success",
        description: "Class booked successfully!",
      });

      fetchClasses(); // Refresh the classes list
    } catch (error) {
      console.error("Error booking class:", error);
      toast({
        title: "Error",
        description: "Failed to book class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { classes, fetchClasses, bookClass };
};
