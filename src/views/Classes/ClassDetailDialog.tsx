"use client";

import React from "react";
import { Button } from "@/components/ui/legacy/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/legacy/dialog";
import { Building, Calendar, Clock, Dumbbell, User, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { IClassData } from "@/lib/IClassData";

export default function ClassDetailDialog({
  classItem,
  open,
  onClose,
  onBook,
  isCompanyAdmin,
}: {
  classItem: IClassData | null;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
  isCompanyAdmin: boolean;
}) {
  if (!classItem) return null;

  const isFull = classItem.current_bookings >= classItem.max_capacity;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Image area */}
        {classItem.image_url ? (
          <img
            src={classItem.image_url}
            alt={classItem.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <Dumbbell className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{classItem.title}</DialogTitle>
            {classItem.organization_name && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Building className="w-3 h-3" />
                {classItem.organization_name}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-3 my-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(classItem.class_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(classItem.class_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {classItem.current_bookings}/{classItem.max_capacity} spots filled
              </span>
            </div>
          </div>

          {/* Instructor row */}
          <div className="flex items-center gap-3 py-3 border-t border-gray-100">
            {classItem.instructor_photo_url ? (
              <img
                src={classItem.instructor_photo_url}
                alt={classItem.instructor_name || "Instructor"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <span className="text-sm text-gray-700">
              {classItem.instructor_name || classItem.instructor_uid}
            </span>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onBook} disabled={isCompanyAdmin || isFull}>
              {isFull ? "Class Full" : "Book Class"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
