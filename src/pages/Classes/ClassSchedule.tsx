import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassData {
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

const ClassSchedule = () => {
  const { user } = useAuthContext();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
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

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">Loading classes...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Classes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and book amazing fitness classes from top wellness
            companies
          </p>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No upcoming classes
            </h3>
            <p className="text-gray-600">Check back soon for new classes!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {classItem.title}
                      </CardTitle>
                      <CardDescription>
                        with {classItem.instructor}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 flex-col">
                      <Badge variant="outline">{classItem.class_type}</Badge>
                      <Badge variant="secondary">{classItem.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(classItem.class_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {formatTime(classItem.class_time)} (
                        {classItem.duration_minutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {classItem.current_bookings}/{classItem.max_capacity}{" "}
                        spots filled
                      </span>
                    </div>
                    {classItem.companies?.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {classItem.companies.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {classItem.companies?.company_name && (
                    <p className="text-sm text-gray-500 mb-4">
                      Hosted by {classItem.companies.company_name}
                    </p>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => bookClass(classItem.id)}
                    disabled={
                      classItem.current_bookings >= classItem.max_capacity
                    }
                  >
                    {classItem.current_bookings >= classItem.max_capacity
                      ? "Class Full"
                      : "Book Class"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ClassSchedule;
