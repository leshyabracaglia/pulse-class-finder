import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
  isCompany: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only handle redirects for actual sign-in events from the auth page
      if (event === "SIGNED_IN" && session?.user) {
        const currentPath = window.location.pathname;

        // Only redirect if we're coming from the auth page
        if (currentPath === "/auth") {
          // Defer the company check to avoid potential deadlocks
          setTimeout(async () => {
            try {
              const { data: companyData } = await supabase
                .from("companies")
                .select("id")
                .eq("user_id", session.user.id)
                .single();

              if (companyData) {
                console.log("Redirecting company user to company dashboard");
                setIsCompany(true);
                window.location.href = "/company-dashboard";
              } else {
                console.log("Redirecting regular user to main page");
                window.location.href = "/";
              }
            } catch (error) {
              console.log("No company profile found, redirecting to main page");
              window.location.href = "/";
            }
          }, 100);
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    isCompany,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
