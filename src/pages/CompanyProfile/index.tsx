
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";
import { Building } from "lucide-react";

interface CompanyProfile {
  id: string;
  company_name: string;
  description: string | null;
  contact_email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  avatar_url?: string;
}

export default function CompanyProfile() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    contact_email: "",
    phone: "",
    address: "",
    website: "",
  });

  useEffect(() => {
    if (user) {
      fetchCompany();
    }
  }, [user]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No company found, redirect to regular profile
          window.location.href = "/profile";
          return;
        }
        throw error;
      }

      setCompany(data);
      setFormData({
        company_name: data.company_name || "",
        description: data.description || "",
        contact_email: data.contact_email || "",
        phone: data.phone || "",
        address: data.address || "",
        website: data.website || "",
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      toast({
        title: "Error",
        description: "Failed to load company profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async () => {
    if (!user || !company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company profile updated successfully!",
      });

      fetchCompany();
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: "Failed to update company profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your company profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Company Profile
              </h1>
              <p className="text-sm text-gray-600">Manage your company information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Logo Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={company?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {formData.company_name ? formData.company_name.charAt(0).toUpperCase() : "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Logo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your company"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={updateCompany} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
