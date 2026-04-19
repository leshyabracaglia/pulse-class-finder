"use client";

import React, { useEffect, useState } from "react";
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
      try {
        const res = await fetch(`/api/attendance?class_id=${classId}`);
        if (!res.ok) throw new Error("Failed to fetch attendees");
        const data = await res.json();
        setAttendees(data);
      } catch (error) {
        console.error("Error fetching attendees:", error);
        setAttendees([]);
      } finally {
        setLoading(false);
      }
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
