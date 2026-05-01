"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/legacy/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/legacy/label";
import { Calendar, Clock, Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { IClassData } from "@/lib/IClassData";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import InstructorSelector from "./InstructorSelector";
import { useClassesContext } from "@/providers/ClassesProvider";
import AttendanceView from "./AttendanceView";

function AddEditClassForm({
  editingClass,
  onClose,
}: {
  editingClass: IClassData | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { createClass, updateClass } = useClassesContext();
  const { organization } = useOrganizationContext();

  const [classData, setClassData] = useState<IClassData>({
    id: editingClass?.id || crypto.randomUUID(),
    organization_uid: organization.organization_uid,
    instructor_uid: editingClass?.instructor_uid || "",
    title: editingClass?.title || "",
    class_time: editingClass?.class_time || "",
    class_date: editingClass?.class_date || "",
    max_capacity: editingClass?.max_capacity || 0,
    price_cents: editingClass?.price_cents || 0,
    current_bookings: editingClass?.current_bookings || 0,
    image_url: editingClass?.image_url || null,
  });

  useEffect(() => {
    setClassData({
      id: editingClass?.id || crypto.randomUUID(),
      organization_uid: organization.organization_uid,
      instructor_uid: editingClass?.instructor_uid || "",
      title: editingClass?.title || "",
      class_time: editingClass?.class_time || "",
      class_date: editingClass?.class_date || "",
      max_capacity: editingClass?.max_capacity || 0,
      price_cents: editingClass?.price_cents || 0,
      current_bookings: editingClass?.current_bookings || 0,
      image_url: editingClass?.image_url || null,
    });
  }, [editingClass, organization.organization_uid]);

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    try {
      const success = editingClass
        ? await updateClass(classData)
        : await createClass({ ...classData, org_wallet: organization.wallet_address });

      if (!success) {
        toast({
          title: "Error",
          description: editingClass ? "Failed to update class." : "Failed to create class.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: editingClass ? "Class updated successfully." : "Class created successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Error saving class:", error);
      toast({
        title: "Error",
        description: "Failed to save class.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{editingClass ? "Edit Class" : "Add New Class"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmitClass}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <Label htmlFor="title">Class Title</Label>
            <Input
              id="title"
              value={classData.title}
              onChange={(e) =>
                setClassData({ ...classData, title: e.target.value })
              }
              placeholder="e.g., Morning Yoga"
              required
            />
          </div>
          <InstructorSelector
            instructorUid={classData.instructor_uid}
            updateInstructorUid={(instructorUid) =>
              setClassData({ ...classData, instructor_uid: instructorUid })
            }
          />
          <div>
            <Label htmlFor="classDate">Date</Label>
            <Input
              id="classDate"
              type="date"
              value={classData.class_date}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  class_date: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="classTime">Time</Label>
            <Input
              id="classTime"
              type="time"
              value={classData.class_time}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  class_time: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input
              id="maxCapacity"
              type="number"
              value={classData.max_capacity}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  max_capacity: Number(e.target.value),
                })
              }
              min="1"
              max="100"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={(classData.price_cents / 100).toFixed(2)}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  price_cents: Math.round(Number(e.target.value) * 100),
                })
              }
              placeholder="0.00"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="imageUrl">Class Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={classData.image_url || ""}
              onChange={(e) =>
                setClassData({ ...classData, image_url: e.target.value || null })
              }
              placeholder="https://example.com/class-image.jpg"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">
              {editingClass ? "Update Class" : "Create Class"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ClassCard({
  classItem,
  handleEditClass,
  onViewAttendance,
}: {
  classItem: IClassData;
  handleEditClass: (classItem: IClassData) => void;
  onViewAttendance: (classItem: IClassData) => void;
}) {
  const { toast } = useToast();
  const { deleteClass } = useClassesContext();

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    const success = await deleteClass(classId);
    if (success) {
      toast({ title: "Success", description: "Class deleted successfully." });
    }
  };

  return (
    <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{classItem.title}</CardTitle>
            <CardDescription>with {classItem.instructor_uid}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              aria-label="View bookings"
              onClick={() => onViewAttendance(classItem)}
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Edit class"
              onClick={() => handleEditClass(classItem)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Delete class"
              onClick={() => handleDeleteClass(classItem.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{classItem.class_time}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrganizationClassesDisplay() {
  const { organization, organizationClasses } = useOrganizationContext();

  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState<IClassData | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<IClassData | null>(null);

  const isLoading = !organization || !organizationClasses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-lg">Loading your company dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Your Classes</h2>
          <p className="text-zinc-600">Manage your fitness classes</p>
        </div>
        <Button onClick={() => { setEditingClass(null); setShowAddClass(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>
      {showAddClass && (
        <AddEditClassForm
          editingClass={editingClass}
          onClose={() => { setShowAddClass(false); setEditingClass(null); }}
        />
      )}
      {organizationClasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              No classes yet
            </h3>
            <p className="text-zinc-600 mb-4">
              Start by creating your first fitness class.
            </p>
            <Button onClick={() => { setEditingClass(null); setShowAddClass(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {organizationClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              handleEditClass={() => {
                setEditingClass(classItem);
                setShowAddClass(true);
              }}
              onViewAttendance={(c) => setAttendanceClass(c)}
            />
          ))}
        </div>
      )}
      {attendanceClass && (
        <AttendanceView
          classId={attendanceClass.id}
          classTitle={attendanceClass.title}
          maxCapacity={attendanceClass.max_capacity}
          currentBookings={attendanceClass.current_bookings}
          open={!!attendanceClass}
          onClose={() => setAttendanceClass(null)}
        />
      )}
    </>
  );
}
