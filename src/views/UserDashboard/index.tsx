"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/legacy/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { Calendar, Clock, Users, User } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  class_id: string;
  booking_status: string;
  booked_at: string;
  class_title: string;
  class_time: string;
  class_date: string;
  max_capacity: number;
  instructor_uid: string;
}

const UserDashboard = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
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

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_status: "cancelled" }),
      });

      if (!res.ok) throw new Error("Failed to cancel booking");

      toast({
        title: "Success",
        description: "Booking cancelled successfully.",
      });

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                My Dashboard
              </h1>
              <p className="text-sm text-zinc-400">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/home")}>
            Browse Classes
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            My Booked Classes
          </h2>
          <p className="text-zinc-400 font-display">Manage your upcoming fitness classes</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No classes booked
              </h3>
              <p className="text-zinc-400 mb-4 font-display">
                You haven't booked any classes yet.
              </p>
              <Button onClick={() => router.push("/home")}>
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
                        {booking.class_title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Instructor: {booking.instructor_uid}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-numeric">
                        {formatDate(booking.class_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-numeric">
                        {formatTime(booking.class_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Booking confirmed</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-zinc-500 font-numeric">
                      Booked on{" "}
                      {new Date(booking.booked_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelBooking(booking.id)}
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
