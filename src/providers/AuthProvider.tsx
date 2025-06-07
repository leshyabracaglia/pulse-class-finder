
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

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only handle redirects for sign-in events, not general auth state changes
      if (event === "SIGNED_IN" && session?.user) {
        // Defer the company check to avoid potential deadlocks
        setTimeout(async () => {
          try {
            const { data: companyData } = await supabase
              .from("companies")
              .select("id")
              .eq("user_id", session.user.id)
              .single();

            // Only redirect if company exists AND we're currently on auth page or root
            const currentPath = window.location.pathname;
            if (
              companyData &&
              (currentPath === "/auth" || currentPath === "/")
            ) {
              console.log("Redirecting company user to company dashboard");
              window.location.href = "/company-dashboard";
            } else if (!companyData && currentPath === "/auth") {
              // Regular user, redirect to main page only if on auth page
              console.log("Redirecting regular user to main page");
              window.location.href = "/";
            }
          } catch (error) {
            // If no company found or error, only redirect if on auth page
            console.log("No company profile found or error, staying on current page");
            if (window.location.pathname === "/auth") {
              window.location.href = "/";
            }
          }
        }, 100);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
