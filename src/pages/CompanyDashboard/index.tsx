import React, { useCallback, useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Building, Package } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import PackageManager from "@/pages/CompanyDashboard/PackageManager";
import { IClassData } from "@/lib/IClassData";
import CompanyDashboardClasses from "./CompanyDashboardClasses";

export interface ICompany {
  id: string;
  company_name: string;
  description: string;
  contact_email: string;
  phone: string;
  address: string;
  website: string;
  is_approved: boolean;
}

export default function CompanyDashboard() {
  const { user, signOut } = useAuthContext();
  const { toast } = useToast();

  const [company, setCompany] = useState<ICompany | null>(null);
  const [classes, setClasses] = useState<IClassData[]>();

  const fetchCompanyData = useCallback(async () => {
    try {
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (companyError) {
        if (companyError.code === "PGRST116") {
          // No company found, redirect to regular dashboard
          window.location.href = "/dashboard";
          return;
        }
        throw companyError;
      }

      console.log("companyData", companyData);
      setCompany(companyData);

      // Fetch company's classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select<string, IClassData>("*")
        .eq("company_id", companyData.id)
        .order("class_date", { ascending: true });

      if (classesError) throw classesError;
      setClasses(classesData || []);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast({
        title: "Error",
        description: "Failed to load company data.",
        variant: "destructive",
      });
    }
  }, [toast, user?.id]);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [fetchCompanyData, user]);

  // useEffect(() => {
  //   if (!user) {
  //     window.location.href = "/auth";
  //   }
  // }, [user]);

  const isLoading = !company || !classes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your company dashboard...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Company Profile Found</CardTitle>
            <CardDescription>
              You don't have a company profile associated with this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* <Button onClick={() => (window.location.href = "/dashboard")}>
              Go to User Dashboard
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Company Dashboard
              </h1>
              <p className="text-sm text-gray-600">{company.company_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              View Public Site
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Company Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{company.company_name}</CardTitle>
                <CardDescription>{company.description}</CardDescription>
              </div>
              <Badge variant={company.is_approved ? "default" : "secondary"}>
                {company.is_approved ? "Approved" : "Pending Approval"}
              </Badge>
            </div>
          </CardHeader>
          {!company.is_approved && (
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Your company is pending approval. Once approved, your classes
                  will be visible to users.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabs for Classes and Packages */}
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Packages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="mt-6">
            <CompanyDashboardClasses
              company={company}
              classes={classes}
              fetchCompanyData={fetchCompanyData}
            />
          </TabsContent>

          <TabsContent value="packages" className="mt-6">
            <PackageManager companyId={company.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
