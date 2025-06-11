import React, { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
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
import { Building, Globe, Mail, Phone } from "lucide-react";
import { useCompanyProfileContext } from "./CompanyProfileProvider";
import CompanyProfileProvider from "./CompanyProfileProvider";
import { DEFAULT_COMPANY_PROFILE_FORM_DATA } from "./constants";

function CompanyInfoFormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: "text" | "email" | "tel" | "url";
}) {
  return (
    <div>
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}

function EditCompanyInformationCard() {
  const { company, updateCompany, fetchCompany } = useCompanyProfileContext();
  const { user } = useAuthContext();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_COMPANY_PROFILE_FORM_DATA);

  const onUpdateCompany = async () => {
    if (!user || !company) return;

    setSaving(true);

    const data = await updateCompany(formData);
    if (!data) return;
    setFormData({
      company_name: data.company_name || "",
      description: data.description || "",
      contact_email: data.contact_email || "",
      phone: data.phone || "",
      address: data.address || "",
      website: data.website || "",
    });
    await fetchCompany();

    setSaving(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFetchCompany = useCallback(async () => {
    const data = await fetchCompany();
    console.log("data", data);
    if (!data) return;
    setFormData({
      company_name: data.company_name || "",
      description: data.description || "",
      contact_email: data.contact_email || "",
      phone: data.phone || "",
      address: data.address || "",
      website: data.website || "",
    });
  }, [fetchCompany]);

  useEffect(() => {
    if (user) {
      handleFetchCompany();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!company)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Update your company details and logo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Logo Section */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={company?.avatar_url} />
            <AvatarFallback className="text-lg">
              {formData.company_name
                ? formData.company_name.charAt(0).toUpperCase()
                : "C"}
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
          <CompanyInfoFormInput
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            placeholder="Enter company name"
          />
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
          <CompanyInfoFormInput
            label="Contact Email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleInputChange("contact_email", e.target.value)}
            placeholder="contact@company.com"
          />
          <CompanyInfoFormInput
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            type="tel"
          />
          <CompanyInfoFormInput
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main St, City, State 12345"
          />
          <CompanyInfoFormInput
            label="Website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.company.com"
            type="url"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={onUpdateCompany} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyProfileCard() {
  const { company } = useCompanyProfileContext();

  if (!company)
    return (
      <Card>
        <CardHeader>
          <CardTitle>How we'll display your company</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>How we'll display your company</CardTitle>
        <div className="p-4">
          <Card className="p-4 gap-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={company.avatar_url} />
                <AvatarFallback className="text-xl">
                  {company.company_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{company.company_name}</CardTitle>
            </div>
            <CardDescription>{company.description}</CardDescription>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <p>{company.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <p>{company.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <p>{company.address}</p>
                  </div>
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <p>{company.website}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end h-full items-center">
                  <Button variant="outline" size="sm" disabled>
                    View Classes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardHeader>
    </Card>
  );
}

function CompanyProfile() {
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
              <p className="text-sm text-gray-600">
                Manage your company information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <CompanyProfileCard />
          <EditCompanyInformationCard />
        </div>
      </div>
    </div>
  );
}

export default function CompanyProfileWrapper() {
  return (
    <CompanyProfileProvider>
      <CompanyProfile />
    </CompanyProfileProvider>
  );
}
