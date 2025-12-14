import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "./AuthProvider";
import { IOrganizationData } from "@/lib/IOrganizationData";

interface IOrganizationContext {
  organization: IOrganizationData | null;
  fetchOrganization: () => void;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(
  undefined
);

export default function AuthProvider({
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
        .from("organization_admins")
        .select("organization_uid, organizations (name)")
        .eq("user_uid", user.id)
        .single();

      if (error) throw error;
      setOrganization({
        organization_uid: data.organization_uid,
        name: data.organizations.name,
      });
      return data;
    } catch (error) {
      console.error("Error fetching organization:", error);
      return null;
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener
    if (!user?.id) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchOrganization();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchOrganization, user]);

  // useEffect(() => {
  //   if (isCompanyAdmin || !session?.user) return;

  //   const checkUserType = async () => {
  //     if (!session?.user) return;

  //     const isOrganizationAdmin = await checkOrganizationAdmin(session?.user);
  //     setIsCompanyAdmin(isOrganizationAdmin);
  //   };

  //   checkUserType();
  // }, [isCompanyAdmin, session?.user]);

  return (
    <OrganizationContext.Provider value={{ organization, fetchOrganization }}>
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
