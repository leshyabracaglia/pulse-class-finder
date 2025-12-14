import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/App";
import { useLocation } from "react-router-dom";

interface IAuthContext {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isCompanyAdmin: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

async function checkOrganizationAdmin(user: User) {
  const { data } = await supabase
    .from("organization_admins")
    .select("organization_uid")
    .eq("user_uid", user.id)
    .single();

  return !!data;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        const currentPath = window.location.pathname;

        // Only redirect if we're coming from the auth page
        if (currentPath === ROUTES.AUTH) {
          // Defer the company check to avoid potential deadlocks
          setTimeout(async () => {
            try {
              const { data: companyData } = await supabase
                .from("organization_admins")
                .select("organization_uid")
                .eq("user_uid", session.user.id)
                .single();

              if (companyData) {
                console.log(
                  "Redirecting organization admin to organization dashboard"
                );
                setIsCompanyAdmin(true);
                window.location.href = ROUTES.COMPANY_DASHBOARD;
              } else {
                console.log("Redirecting regular user to main page");
                window.location.href = ROUTES.HOME;
              }
            } catch (error) {
              console.log("No company profile found, redirecting to main page");
              window.location.href = ROUTES.HOME;
            }
          }, 100);
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("\n\nhere: ", session);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isCompanyAdmin || !session?.user) return;

    const checkUserType = async () => {
      if (!session?.user) return;

      const isOrganizationAdmin = await checkOrganizationAdmin(session?.user);
      setIsCompanyAdmin(isOrganizationAdmin);
    };

    checkUserType();
  }, [isCompanyAdmin, session?.user]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (
        error &&
        !error.message
          .toLowerCase()
          .includes("session from session_id claim in jwt does not exist")
      ) {
        console.error("Supabase signOut error:", error);
      }
    } catch (e) {
      // Network or unexpected errors shouldn't block clearing local auth state.
      console.error("Unexpected signOut error:", e);
    } finally {
      setSession(null);
      setIsCompanyAdmin(false);

      window.location.href = ROUTES.AUTH;
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    isCompanyAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
