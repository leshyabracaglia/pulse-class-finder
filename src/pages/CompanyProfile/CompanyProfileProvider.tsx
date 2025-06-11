import { createContext, useContext, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";

export interface ICompanyProfile {
  id: string;
  company_name: string;
  description: string | null;
  contact_email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  avatar_url?: string;
}

export interface ICompanyProfileFormData {
  company_name: string;
  description: string;
  contact_email: string;
  phone: string;
  address: string;
  website: string;
}

const CompanyProfileContext = createContext<{
  company: ICompanyProfile | null;
  updateCompany: (
    formData: ICompanyProfileFormData
  ) => Promise<ICompanyProfile | null>;
  fetchCompany: () => Promise<ICompanyProfile | null>;
} | null>(undefined);

export default function CompanyProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [company, setCompany] = useState<ICompanyProfile | null>(null);

  const fetchCompany = async (): Promise<ICompanyProfile | null> => {
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
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load company profile.",
        variant: "destructive",
      });
    }
  };

  const updateCompany = async (formData: ICompanyProfileFormData) => {
    if (!user || !company) return;
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

      const data = await fetchCompany();
      return data;
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: "Failed to update company profile.",
        variant: "destructive",
      });
    }
  };

  const value = { company, updateCompany, fetchCompany };

  return (
    <CompanyProfileContext.Provider value={value}>
      {children}
    </CompanyProfileContext.Provider>
  );
}

export function useCompanyProfileContext() {
  const context = useContext(CompanyProfileContext);
  if (context === undefined) {
    throw new Error(
      "useCompanyProfile must be used within a CompanyProfileProvider"
    );
  }
  return context;
}
