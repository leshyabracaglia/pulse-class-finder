import React, { useEffect, useState } from "react";
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
import { Calendar, Clock, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  class_id: string;
  booking_status: string;
  booked_at: string;
  classes: {
    title: string;
    instructor: string;
    class_time: string;
    class_date: string;
    duration_minutes: number;
    class_type: string;
    difficulty: string;
  };
}

const UserDashboard = () => {
  const { user, signOut } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          classes (
            title,
            instructor,
            class_time,
            class_date,
            duration_minutes,
            class_type,
            difficulty
          )
        `
        )
        .eq("user_id", user?.id)
        .eq("booking_status", "confirmed")
        .order("booked_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, classId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Update current_bookings count by decrementing it
      const { data: classData, error: fetchError } = await supabase
        .from("classes")
        .select("current_bookings")
        .eq("id", classId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("classes")
        .update({
          current_bookings: Math.max(0, classData.current_bookings - 1),
        })
        .eq("id", classId);

      if (updateError)
        console.error("Error updating class capacity:", updateError);

      toast({
        title: "Success",
        description: "Booking cancelled successfully.",
      });

      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Dashboard
              </h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Browse Classes
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            My Booked Classes
          </h2>
          <p className="text-gray-600">Manage your upcoming fitness classes</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No classes booked
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't booked any classes yet.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Browse Available Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {booking.classes.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        with {booking.classes.instructor}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {booking.classes.class_type}
                      </Badge>
                      <Badge variant="secondary">
                        {booking.classes.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(booking.classes.class_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {formatTime(booking.classes.class_time)} (
                        {booking.classes.duration_minutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Booking confirmed</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Booked on{" "}
                      {new Date(booking.booked_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        cancelBooking(booking.id, booking.class_id)
                      }
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
