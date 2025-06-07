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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Edit, Trash2, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PackageData {
  id: string;
  name: string;
  description: string;
  package_type: "class_count" | "time_based";
  class_count: number | null;
  duration_days: number | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
}

interface PackageManagerProps {
  companyId: string;
}

const PackageManager = ({ companyId }: PackageManagerProps) => {
  const { user } = useAuthContext();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(
    null
  );
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packageType, setPackageType] = useState<"class_count" | "time_based">(
    "class_count"
  );
  const [classCount, setClassCount] = useState(10);
  const [durationDays, setDurationDays] = useState(30);
  const [priceCents, setPriceCents] = useState(5000);

  useEffect(() => {
    fetchPackages();
  }, [companyId]);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(
        (data || []).map((pkg) => ({
          ...pkg,
          package_type: pkg.package_type as "class_count" | "time_based",
        }))
      );
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPackageType("class_count");
    setClassCount(10);
    setDurationDays(30);
    setPriceCents(5000);
    setEditingPackage(null);
    setShowAddPackage(false);
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const packageData = {
        company_id: companyId,
        name,
        description,
        package_type: packageType,
        class_count: packageType === "class_count" ? classCount : null,
        duration_days: packageType === "time_based" ? durationDays : null,
        price_cents: priceCents,
        is_active: true,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from("packages")
          .update(packageData)
          .eq("id", editingPackage.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Package updated successfully.",
        });
      } else {
        const { error } = await supabase.from("packages").insert(packageData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Package created successfully.",
        });
      }

      resetForm();
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      toast({
        title: "Error",
        description: "Failed to save package.",
        variant: "destructive",
      });
    }
  };

  const handleEditPackage = (packageItem: PackageData) => {
    setName(packageItem.name);
    setDescription(packageItem.description || "");
    setPackageType(packageItem.package_type);
    setClassCount(packageItem.class_count || 10);
    setDurationDays(packageItem.duration_days || 30);
    setPriceCents(packageItem.price_cents);
    setEditingPackage(packageItem);
    setShowAddPackage(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package deleted successfully.",
      });

      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete package.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (loading) {
    return <div className="text-center py-4">Loading packages...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Class Packages</h3>
          <p className="text-gray-600">
            Create and manage class packages for your customers
          </p>
        </div>
        <Button onClick={() => setShowAddPackage(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Add/Edit Package Form */}
      {showAddPackage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingPackage ? "Edit Package" : "Add New Package"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitPackage}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., 10 Class Package"
                  required
                />
              </div>
              <div>
                <Label htmlFor="packageType">Package Type</Label>
                <Select
                  value={packageType}
                  onValueChange={(value: "class_count" | "time_based") =>
                    setPackageType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class_count">
                      Fixed Number of Classes
                    </SelectItem>
                    <SelectItem value="time_based">
                      Time-Based Access
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {packageType === "class_count" && (
                <div>
                  <Label htmlFor="classCount">Number of Classes</Label>
                  <Input
                    id="classCount"
                    type="number"
                    value={classCount}
                    onChange={(e) => setClassCount(Number(e.target.value))}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              )}
              {packageType === "time_based" && (
                <div>
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min="1"
                    max="365"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formatPrice(priceCents)}
                  onChange={(e) =>
                    setPriceCents(Math.round(Number(e.target.value) * 100))
                  }
                  min="0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's included in this package..."
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No packages yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first class package to start selling bundles.
            </p>
            <Button onClick={() => setShowAddPackage(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {packages.map((packageItem) => (
            <Card
              key={packageItem.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {packageItem.name}
                    </CardTitle>
                    <CardDescription>{packageItem.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={packageItem.is_active ? "default" : "secondary"}
                    >
                      {packageItem.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPackage(packageItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePackage(packageItem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="capitalize">
                      {packageItem.package_type.replace("_", " ")}
                    </span>
                  </div>
                  {packageItem.package_type === "class_count" && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{packageItem.class_count} classes</span>
                    </div>
                  )}
                  {packageItem.package_type === "time_based" && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{packageItem.duration_days} days</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${formatPrice(packageItem.price_cents)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageManager;
