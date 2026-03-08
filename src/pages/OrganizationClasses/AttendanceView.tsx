import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/legacy/dialog";

interface Attendee {
  id: string;
  booked_at: string;
  full_name: string;
  email: string;
}

interface AttendanceViewProps {
  classId: string;
  classTitle: string;
  maxCapacity: number;
  currentBookings: number;
  open: boolean;
  onClose: () => void;
}

export default function AttendanceView({
  classId,
  classTitle,
  maxCapacity,
  currentBookings,
  open,
  onClose,
}: AttendanceViewProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchAttendees() {
      setLoading(true);
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, user_id, booked_at")
        .eq("class_id", classId)
        .eq("booking_status", "confirmed");

      if (!bookings || bookings.length === 0) {
        setAttendees([]);
        setLoading(false);
        return;
      }

      const userIds = bookings.map((b) => b.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap: Record<string, { full_name: string; email: string }> = {};
      profiles?.forEach((p) => {
        profileMap[p.id] = { full_name: p.full_name, email: p.email };
      });

      setAttendees(
        bookings.map((b) => ({
          id: b.id,
          booked_at: b.booked_at,
          full_name: profileMap[b.user_id]?.full_name || "Unknown",
          email: profileMap[b.user_id]?.email || "Unknown",
        }))
      );
      setLoading(false);
    }

    fetchAttendees();
  }, [open, classId]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance — {classTitle}</DialogTitle>
          <DialogDescription>
            {currentBookings} / {maxCapacity} spots filled
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : attendees.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No bookings yet for this class.
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Booked On</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2">{a.full_name}</td>
                    <td className="py-2 text-gray-600">{a.email}</td>
                    <td className="py-2 text-gray-600">
                      {new Date(a.booked_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
