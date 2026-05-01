"use client";

import React, { useMemo, useState } from "react";
import ClassDetailDialog from "./ClassDetailDialog";
import BookingConfirmDialog from "./BookingConfirmDialog";
import BookingConfirmationDialog from "./BookingConfirmationDialog";
import { Button } from "@/components/ui/legacy/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { Input } from "@/components/ui/Input";
import { Building, Calendar, Clock, Locate, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import useUserLocation from "./useUserLocation";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import { useClassesContext } from "@/providers/ClassesProvider";
import { IClassData } from "@/lib/IClassData";

function ClassCard({ classItem }: { classItem: IClassData }) {
  const { organization } = useOrganizationContext();
  const { bookClass } = useClassesContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmingClass, setConfirmingClass] = useState<IClassData | null>(null);
  const [confirmedClass, setConfirmedClass] = useState<IClassData | null>(null);
  const [booking, setBooking] = useState(false);

  const isCompanyAdmin = !!organization;
  const isFull = classItem.current_bookings >= classItem.max_capacity;

  const handleBook = async () => {
    setBooking(true);
    const success = await bookClass(classItem.id);
    setBooking(false);
    setDialogOpen(false);
    setConfirmingClass(null);
    if (success) setConfirmedClass(classItem);
  };

  return (
    <>
      <Card
        key={classItem.id}
        className="shadow-lg transition-shadow cursor-pointer"
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{classItem.title}</CardTitle>
              <CardDescription>
                with {classItem.instructor_name}
              </CardDescription>
              {classItem.organization_name && (
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {classItem.organization_name}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-numeric">
                {formatDate(classItem.class_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-numeric">
                {formatTime(classItem.class_time)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-numeric">
                {classItem.current_bookings}/{classItem.max_capacity} spots
                filled
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingClass(classItem);
            }}
            disabled={isCompanyAdmin || isFull}
          >
            {isFull ? "Class Full" : "Book Class"}
          </Button>
        </CardContent>
      </Card>
      <ClassDetailDialog
        classItem={classItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onBook={() => { setDialogOpen(false); setConfirmingClass(classItem); }}
        isCompanyAdmin={isCompanyAdmin}
      />
      <BookingConfirmDialog
        classItem={confirmingClass}
        open={!!confirmingClass}
        loading={booking}
        onConfirm={handleBook}
        onClose={() => setConfirmingClass(null)}
      />
      <BookingConfirmationDialog
        classItem={confirmedClass}
        open={!!confirmedClass}
        onClose={() => setConfirmedClass(null)}
      />
    </>
  );
}

export default function ClassSchedule() {
  const { classes } = useClassesContext();
  const { location, requestLocation } = useUserLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const isLoading = !classes;

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.instructor_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (c.organization_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesDate = !filterDate || c.class_date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [classes, searchQuery, filterDate]);

  const hasFilters = searchQuery || filterDate;

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">Loading classes...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Upcoming Classes
          </h2>

          {classes.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={requestLocation}
                disabled={location.loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Locate className="w-4 h-4" />
                {location.loading
                  ? "Getting location..."
                  : location.latitude
                  ? "Location enabled"
                  : "Show distances"}
              </Button>
            </div>
          )}

          {location.error && (
            <p className="text-sm text-red-600 mt-2">{location.error}</p>
          )}
        </div>

        {classes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Input
              className="flex-1"
              placeholder="Search by class, instructor, or studio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
              type="date"
              className="sm:w-48"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterDate("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            {hasFilters ? (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No matching classes
                </h3>
                <p className="text-zinc-400 font-display">
                  Try clearing your filters.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No upcoming classes
                </h3>
                <p className="text-zinc-400 font-display">
                  Check back soon for new classes!
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
