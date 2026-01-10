import React, { createContext, useCallback, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "./AuthProvider";
import { IOrganizationData } from "@/lib/IOrganizationData";

interface IOrganizationContext {
  organization: IOrganizationData | null;
  fetchOrganization: () => void;
  createOrganization: ({
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
  }) => Promise<boolean>;
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

  const [organization, setOrganization] = useState<IOrganizationData | null>(
    null
  );

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

  return (
    <OrganizationContext.Provider
      value={{ organization, fetchOrganization, createOrganization }}
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
