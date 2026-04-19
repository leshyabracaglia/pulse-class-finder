"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/legacy/button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { Avatar, AvatarFallback } from "@/components/ui/legacy/avatar";
import { Building, Globe, Mail, Phone } from "lucide-react";
import { useOrganizationContext } from "@/providers/OrganizationProvider";

function EditOrganizationInformationCard() {
  const { organization, updateOrganization } = useOrganizationContext();
  const { user } = useAuthContext();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
    contactEmail: organization?.contactEmail || "",
    phone: organization?.phone || "",
    address: organization?.address || "",
    website: organization?.website || "",
  });

  const onUpdateCompany = async () => {
    if (!user || !organization) return;

    setSaving(true);
    await updateOrganization(formData);
    setSaving(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Update your company details and logo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {/* <AvatarImage src={organization?.logo_url} /> */}
            <AvatarFallback className="text-lg">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "O"}
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
        <div className="space-y-4">
          <Input
            label="Organization Name"
            id="name"
            value={formData.name || organization?.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter organization name"
          />
          <Input
            label="Description"
            id="description"
            value={formData.description || organization?.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter organization description"
          />
          <Input
            label="Contact Email"
            type="email"
            id="contactEmail"
            value={formData.contactEmail || organization?.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
            placeholder="contact@organization.com"
          />
          <Input
            label="Phone"
            id="phone"
            value={formData.phone || organization?.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            type="tel"
          />
          <Input
            label="Address"
            id="address"
            value={formData.address || organization?.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main St, City, State 12345"
          />
          <Input
            label="Website"
            id="website"
            value={formData.website || organization?.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.company.com"
            type="url"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onUpdateCompany} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationProfileCard() {
  const { organization } = useOrganizationContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>How we'll display your company</CardTitle>
        <div className="p-4">
          <Card className="p-4 gap-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Avatar className="w-20 h-20">
                {/* <AvatarImage src={organization?.logo_url} /> */}
                <AvatarFallback className="text-xl">
                  {organization?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{organization?.name}</CardTitle>
            </div>
            <CardDescription>{organization?.description}</CardDescription>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <p>{organization?.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <p>{organization?.contactEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <p>{organization?.address}</p>
                  </div>
                  {organization?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <p>{organization?.website}</p>
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

export default function OrganizationSettings() {
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
          <OrganizationProfileCard />
          <EditOrganizationInformationCard />
        </div>
      </div>
    </div>
  );
}
