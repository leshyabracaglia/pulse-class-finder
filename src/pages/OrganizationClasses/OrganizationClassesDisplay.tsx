import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Calendar, Clock, Plus, Edit, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { IClassData } from "@/lib/IClassData";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import { IOrganizationData } from "@/lib/IOrganizationData";
import InstructorSelector from "./InstructorSelector";
import { useClassesContext } from "@/providers/ClassesProvider";

function AddEditClassForm({
  editingClass,
}: {
  editingClass: IClassData | undefined;
}) {
  const { toast } = useToast();
  const { createClass } = useClassesContext();
  const { organization } = useOrganizationContext();

  const [classData, setClassData] = useState<IClassData>({
    id: editingClass?.id || crypto.randomUUID(),
    organization_uid: organization.organization_uid,
    instructor_uid: editingClass?.instructor_uid || "",
    title: editingClass?.title || "",
    class_time: editingClass?.class_time || "",
    class_date: editingClass?.class_date || "",
    max_capacity: editingClass?.max_capacity || 0,
  });

  const resetForm = () => {
    setClassData({
      id: "",
      organization_uid: "",
      instructor_uid: "",
      title: "",
      class_time: "",
      class_date: "",
      max_capacity: 0,
    });
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    try {
      const success = await createClass(classData);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to create class.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Class created successfully.",
      });

      resetForm();
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
          {/* <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={classData.duration_minutes}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  duration_minutes: Number(e.target.value),
                })
              }
              min="15"
              max="180"
              required
            />
          </div> */}
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
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">
              {editingClass ? "Update Class" : "Create Class"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
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
}: {
  classItem: IClassData;
  handleEditClass: (classItem: IClassData) => void;
}) {
  const { toast } = useToast();

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
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
            {/* <Badge variant="outline">{classItem.class_type}</Badge>
            <Badge variant="secondary">{classItem.difficulty}</Badge> */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClass(classItem)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteClass(classItem.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{classItem.class_time}</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {classItem.current_bookings}/{classItem.max_capacity} booked
            </span>
          </div> */}
          {/* <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                classItem.current_bookings >= classItem.max_capacity
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {classItem.current_bookings >= classItem.max_capacity
                ? "Full"
                : "Available"}
            </span>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrganizationClassesDisplay() {
  const { organization, organizationClasses } = useOrganizationContext();

  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState<IClassData | null>(null);

  const isLoading = !organization || !organizationClasses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your company dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Classes</h2>
          <p className="text-gray-600">Manage your fitness classes</p>
        </div>
        <Button onClick={() => setShowAddClass(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>
      {showAddClass && <AddEditClassForm editingClass={editingClass} />}
      {organizationClasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No classes yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first fitness class.
            </p>
            <Button onClick={() => setShowAddClass(true)}>
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
            />
          ))}
        </div>
      )}
    </>
  );
}
