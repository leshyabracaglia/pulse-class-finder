"use client";

import React, { useRef, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/legacy/avatar";
import { Building, Globe, Mail, Phone } from "lucide-react";
import { useOrganizationContext } from "@/providers/OrganizationProvider";

function EditOrganizationInformationCard() {
  const { organization, updateOrganization } = useOrganizationContext();
  const { user } = useAuthContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
    contactEmail: organization?.contactEmail || "",
    phone: organization?.phone || "",
    address: organization?.address || "",
    website: organization?.website || "",
    logoUrl: organization?.logo_url || "",
  });

  const onUpdateCompany = async () => {
    if (!user || !organization) return;
    setSaving(true);
    await updateOrganization({ ...formData, logo_url: formData.logoUrl || null });
    setSaving(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/organizations/logo", { method: "POST", body });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "Upload failed");
        return;
      }
      const { url } = await res.json();
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const initials = formData.name ? formData.name.charAt(0).toUpperCase() : "O";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Update your company details and logo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {formData.logoUrl && <AvatarImage src={formData.logoUrl} alt={formData.name} />}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Change Logo"}
            </Button>
            <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            label="Organization Name"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter organization name"
          />
          <Input
            label="Description"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter organization description"
          />
          <Input
            label="Contact Email"
            type="email"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
            placeholder="contact@organization.com"
          />
          <Input
            label="Phone"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            type="tel"
          />
          <Input
            label="Address"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main St, City, State 12345"
          />
          <Input
            label="Website"
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.company.com"
            type="url"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onUpdateCompany} disabled={saving || uploading}>
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
                {organization?.logo_url && (
                  <AvatarImage src={organization.logo_url} alt={organization.name} />
                )}
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
              <h1 className="text-xl font-semibold text-gray-900">Company Profile</h1>
              <p className="text-sm text-gray-600">Manage your company information</p>
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
