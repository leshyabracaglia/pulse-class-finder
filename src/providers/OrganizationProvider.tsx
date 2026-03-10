"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthContext } from "./AuthProvider";
import { IOrganizationData } from "@/lib/IOrganizationData";
import { toast } from "@/hooks/useToast";
import { useClassesContext } from "./ClassesProvider";
import { IClassData } from "@/lib/IClassData";

interface IUpdateOrganizationData {
  name: string;
  description: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
}

interface IOrganizationContext {
  organization: IOrganizationData | null;
  organizationClasses: IClassData[] | null;
  fetchOrganization: () => void;
  createOrganization: ({
    name,
    description,
    contactEmail,
    phone,
    address,
    website,
  }: IUpdateOrganizationData) => Promise<boolean>;
  updateOrganization: ({
    name,
    description,
    contactEmail,
    phone,
    address,
    website,
  }: IUpdateOrganizationData) => Promise<boolean>;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(
  undefined
);

export default function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const { classes, fetchClasses } = useClassesContext();

  const [organization, setOrganization] = useState<IOrganizationData | null>(
    null
  );

  useEffect(() => {
    if (classes) {
      return;
    }
    fetchClasses();
  }, [classes, fetchClasses]);

  const organizationClasses = useMemo(() => {
    return classes?.filter(
      (classItem) =>
        classItem.organization_uid === organization?.organization_uid
    );
  }, [classes, organization]);

  const fetchOrganization = useCallback(async () => {
    if (!user) return null;
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to fetch organization");
      const data = await res.json();
      setOrganization(data);
      return data;
    } catch (error) {
      console.error("Error fetching organization:", error);
      return null;
    }
  }, [user]);

  async function createOrganization({
    name,
    description,
    contactEmail,
    phone,
    address,
    website,
  }: IUpdateOrganizationData) {
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, contactEmail, phone, address, website }),
      });

      if (!res.ok) throw new Error("Failed to create organization");

      const data = await res.json();
      setOrganization({
        organization_uid: data.organization_uid,
        name: data.name,
        description: data.description,
        contactEmail: data.contactEmail,
        phone: data.phone,
        address: data.address,
        website: data.website,
      });
      return true;
    } catch (error) {
      console.error("Error creating organization:", error);
      return false;
    }
  }

  async function updateOrganization({
    name,
    description,
    contactEmail,
    phone,
    address,
    website,
  }: IUpdateOrganizationData) {
    if (!organization) return false;
    try {
      const res = await fetch("/api/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_uid: organization.organization_uid,
          name,
          description,
          contactEmail,
          phone,
          address,
          website,
        }),
      });

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to update organization.",
          variant: "destructive",
        });
        return false;
      }

      setOrganization({
        organization_uid: organization.organization_uid,
        name,
        description,
        contactEmail,
        phone,
        address,
        website,
      });
      toast({
        title: "Success",
        description: "Organization updated successfully!",
      });
      return true;
    } catch (error) {
      console.error("Error updating organization:", error);
      return false;
    }
  }

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationClasses,
        fetchOrganization,
        createOrganization,
        updateOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganizationContext must be used within an OrganizationProvider"
    );
  }
  return context;
}
