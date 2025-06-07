import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  CLASS_DIFFICULTIES,
  DEFAULT_CLASS_DATA,
  IClassData,
  IClassDifficulty,
} from "@/lib/IClassData";
import { ICompany } from ".";

function AddEditClassForm({
  company,
  classData,
  setClassData,
  resetForm,
  editingClass,
}: {
  company: ICompany;
  classData: IClassData;
  setClassData: (classData: IClassData) => void;
  resetForm: () => void;
  editingClass: IClassData | undefined;
}) {
  const { toast } = useToast();

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      const classDataToSave = {
        ...classData,
        company_id: company.id,
        current_bookings: editingClass?.current_bookings || 0,
      };

      const { error } = await supabase
        .from("classes")
        .upsert(classDataToSave)
        .eq("id", editingClass.id);

      if (error) throw error;

      if (editingClass) {
        toast({
          title: "Success",
          description: "Class updated successfully.",
        });
      } else {
        toast({
          title: "Success",
          description: "Class created successfully.",
        });
      }

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
          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={classData.instructor}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  instructor: e.target.value,
                })
              }
              placeholder="Instructor name"
              required
            />
          </div>
          <div>
            <Label htmlFor="classType">Class Type</Label>
            <Input
              id="classType"
              value={classData.class_type}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  class_type: e.target.value,
                })
              }
              placeholder="e.g., Yoga, HIIT, Pilates"
              required
            />
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={classData.difficulty}
              onValueChange={(value) =>
                setClassData({
                  ...classData,
                  difficulty: value as IClassDifficulty,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CLASS_DIFFICULTIES.BEGINNER}>
                  Beginner
                </SelectItem>
                <SelectItem value={CLASS_DIFFICULTIES.INTERMEDIATE}>
                  Intermediate
                </SelectItem>
                <SelectItem value={CLASS_DIFFICULTIES.ADVANCED}>
                  Advanced
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
  fetchCompanyData,
}: {
  classItem: IClassData;
  handleEditClass: (classItem: IClassData) => void;
  fetchCompanyData: () => void;
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

      fetchCompanyData();
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
            <CardDescription>with {classItem.instructor}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{classItem.class_type}</Badge>
            <Badge variant="secondary">{classItem.difficulty}</Badge>
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
            <span>
              {classItem.class_time} ({classItem.duration_minutes} min)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {classItem.current_bookings}/{classItem.max_capacity} booked
            </span>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompanyDashboardClasses({
  company,
  classes,
  fetchCompanyData,
}: {
  company: ICompany;
  classes: IClassData[];
  fetchCompanyData: () => void;
}) {
  const { toast } = useToast();

  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState<IClassData | null>(null);

  // Form states for adding/editing classes
  const [classData, setClassData] = useState<IClassData>(DEFAULT_CLASS_DATA);

  const isLoading = !company || !classes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your company dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {/* Classes Management */}
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

      {/* Add/Edit Class Form */}
      {showAddClass && (
        <AddEditClassForm
          company={company}
          classData={classData}
          setClassData={setClassData}
          resetForm={() => {
            setClassData(DEFAULT_CLASS_DATA);
            setEditingClass(null);
            setShowAddClass(false);
          }}
          editingClass={editingClass}
        />
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
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
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              handleEditClass={() => {
                setClassData(classItem);
                setEditingClass(classItem);
                setShowAddClass(true);
              }}
              fetchCompanyData={fetchCompanyData}
            />
          ))}
        </div>
      )}
    </>
  );
}
