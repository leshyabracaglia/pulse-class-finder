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
import { Package, Clock, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserPackage {
  id: string;
  remaining_classes: number | null;
  expires_at: string | null;
  purchased_at: string;
  is_active: boolean;
  packages: {
    id: string;
    name: string;
    description: string;
    package_type: "class_count" | "time_based";
    class_count: number | null;
    duration_days: number | null;
    price_cents: number;
  };
  companies: {
    company_name: string;
  };
}

const UserPackages = () => {
  const { user } = useAuthContext();
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserPackages();
    }
  }, [user]);

  const fetchUserPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("user_packages")
        .select(
          `
          *,
          packages (
            id,
            name,
            description,
            package_type,
            class_count,
            duration_days,
            price_cents
          ),
          companies (
            company_name
          )
        `
        )
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setUserPackages(
        (data || []).map((pkg) => ({
          ...pkg,
          packages: {
            ...pkg.packages,
            package_type: pkg.packages.package_type as
              | "class_count"
              | "time_based",
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching user packages:", error);
      toast({
        title: "Error",
        description: "Failed to load your packages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPackageExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isPackageUsedUp = (packageItem: UserPackage) => {
    if (packageItem.packages.package_type === "class_count") {
      return (packageItem.remaining_classes || 0) <= 0;
    }
    return false;
  };

  const getPackageStatus = (packageItem: UserPackage) => {
    if (!packageItem.is_active) return "inactive";
    if (isPackageExpired(packageItem.expires_at)) return "expired";
    if (isPackageUsedUp(packageItem)) return "used_up";
    return "active";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (loading) {
    return <div className="text-center py-4">Loading your packages...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Your Class Packages</h3>
        <p className="text-gray-600">
          Manage and track your purchased class packages
        </p>
      </div>

      {userPackages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No packages yet
            </h3>
            <p className="text-gray-600 mb-4">
              Browse companies and purchase class packages to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userPackages.map((userPackage) => {
            const status = getPackageStatus(userPackage);
            return (
              <Card
                key={userPackage.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {userPackage.packages.name}
                      </CardTitle>
                      <CardDescription>
                        {userPackage.companies.company_name}
                      </CardDescription>
                      {userPackage.packages.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {userPackage.packages.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          status === "active"
                            ? "default"
                            : status === "expired"
                            ? "destructive"
                            : status === "used_up"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {status === "active"
                          ? "Active"
                          : status === "expired"
                          ? "Expired"
                          : status === "used_up"
                          ? "Used Up"
                          : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="capitalize">
                        {userPackage.packages.package_type.replace("_", " ")}
                      </span>
                    </div>
                    {userPackage.packages.package_type === "class_count" && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {userPackage.remaining_classes || 0} /{" "}
                          {userPackage.packages.class_count} classes left
                        </span>
                      </div>
                    )}
                    {userPackage.packages.package_type === "time_based" &&
                      userPackage.expires_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Expires {formatDate(userPackage.expires_at)}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Purchased {formatDate(userPackage.purchased_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        ${formatPrice(userPackage.packages.price_cents)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserPackages;
