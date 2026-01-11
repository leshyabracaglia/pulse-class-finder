import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/legacy/card";
import { useState } from "react";
import { Button } from "@/components/ui/legacy/button";
import { Input } from "@/components/ui/Input";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import { toast } from "@/hooks/useToast";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";

export default function CreateOrganization() {
  const { createOrganization } = useOrganizationContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    phone: "",
    address: "",
    website: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await createOrganization({
        name: companyData.name,
        description: companyData.description,
        contactEmail: companyData.contactEmail,
        phone: companyData.phone,
        address: companyData.address,
        website: companyData.website,
      });

      if (success) {
        toast({
          title: "Organization created",
          description: "Your organization has been created",
        });
        navigate(ROUTES.ORGANIZATION_SETTINGS);
      } else {
        toast({
          title: "Error",
          description: "Failed to create organization.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
          <CardDescription>
            Create an organization to post classes and manage bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name"
              id="companyName"
              type="text"
              placeholder="Enter your company name"
              value={companyData.name}
              onChange={(e) =>
                setCompanyData({ ...companyData, name: e.target.value })
              }
              required
            />
            <Input
              label="Company Description"
              id="companyDescription"
              type="text"
              placeholder="Brief description of your wellness company"
              value={companyData.description}
              onChange={(e) =>
                setCompanyData({ ...companyData, description: e.target.value })
              }
              required
            />
            <Input
              label="Contact Email"
              id="contactEmail"
              type="email"
              placeholder="Company contact email (optional, will use account email if empty)"
              value={companyData.contactEmail}
              onChange={(e) =>
                setCompanyData({ ...companyData, contactEmail: e.target.value })
              }
              required={false}
            />
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="Company phone number"
              value={companyData.phone}
              onChange={(e) =>
                setCompanyData({ ...companyData, phone: e.target.value })
              }
              required
            />
            <Input
              label="Address"
              id="address"
              type="text"
              placeholder="Company address"
              value={companyData.address}
              onChange={(e) =>
                setCompanyData({ ...companyData, address: e.target.value })
              }
              required
            />
            <Input
              label="Website"
              id="website"
              type="url"
              placeholder="Company website (optional)"
              value={companyData.website}
              onChange={(e) =>
                setCompanyData({ ...companyData, website: e.target.value })
              }
              required={false}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                !companyData.name ||
                !companyData.description ||
                !companyData.contactEmail ||
                !companyData.phone ||
                !companyData.address ||
                !companyData.website
              }
            >
              {loading ? "Loading..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
