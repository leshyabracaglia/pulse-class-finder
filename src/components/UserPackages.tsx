"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { Badge } from "@/components/ui/legacy/badge";
import { Package, Clock, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface UserPackage {
  id: string;
  remaining_classes: number | null;
  expires_at: string | null;
  purchased_at: string;
  is_active: boolean;
  package_name: string;
  package_description: string;
  package_type: "class_count" | "time_based";
  class_count: number | null;
  duration_days: number | null;
  price_cents: number;
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
      const res = await fetch("/api/user-packages");
      if (!res.ok) throw new Error("Failed to fetch user packages");
      const data = await res.json();
      setUserPackages(data || []);
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
    if (packageItem.package_type === "class_count") {
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

  const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
              Browse organizations and purchase class packages to get started.
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
                        {userPackage.package_name}
                      </CardTitle>
                      {userPackage.package_description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {userPackage.package_description}
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
                        {userPackage.package_type.replace("_", " ")}
                      </span>
                    </div>
                    {userPackage.package_type === "class_count" && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {userPackage.remaining_classes || 0} /{" "}
                          {userPackage.class_count} classes left
                        </span>
                      </div>
                    )}
                    {userPackage.package_type === "time_based" &&
                      userPackage.expires_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Expires {formatDateShort(userPackage.expires_at)}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Purchased {formatDateShort(userPackage.purchased_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        ${formatPrice(userPackage.price_cents)}
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
