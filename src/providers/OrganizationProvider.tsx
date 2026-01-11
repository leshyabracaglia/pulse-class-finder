import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
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
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(
          "organization_uid, name, description, contact_email, phone_number, address, website"
        )
        .eq("admin_uid", user.id)
        .single();

      if (error) throw error;
      setOrganization({
        organization_uid: data.organization_uid,
        name: data.name,
        description: data.description,
        contactEmail: data.contact_email,
        phone: data.phone_number,
        address: data.address,
        website: data.website,
      });
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
  }: {
    name: string;
    description: string;
    contactEmail: string;
    phone: string;
    address: string;
    website: string;
  }) {
    const organizationUid = crypto.randomUUID();
    const { error: organizationError } = await supabase
      .from("organizations")
      .insert({
        organization_uid: organizationUid,
        admin_uid: user.id,
        name: name,
        description: description,
        contact_email: contactEmail,
        phone_number: phone,
        address: address,
        website: website,
      });

    if (organizationError) {
      console.error("Error creating organization:", organizationError);
      return false;
    }

    setOrganization({
      organization_uid: organizationUid,
      name: name,
      description: description,
      contactEmail: contactEmail,
      phone: phone,
      address: address,
      website: website,
    });
    return true;
  }

  async function updateOrganization({
    name,
    description,
    contactEmail,
    phone,
    address,
    website,
  }: {
    name: string;
    description: string;
    contactEmail: string;
    phone: string;
    address: string;
    website: string;
  }) {
    if (!organization) return false;
    try {
      const { error: organizationError } = await supabase
        .from("organizations")
        .update({
          name: name,
          description: description,
          contact_email: contactEmail,
          phone_number: phone,
          address: address,
          website: website,
        })
        .eq("organization_uid", organization.organization_uid);
      if (organizationError) {
        toast({
          title: "Error",
          description: "Failed to update organization.",
          variant: "destructive",
        });
        return false;
      }

      setOrganization({
        organization_uid: organization.organization_uid,
        name: name,
        description: description,
        contactEmail: contactEmail,
        phone: phone,
        address: address,
        website: website,
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
