"use client";

import React, { createContext, useContext } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { ROUTES } from "@/lib/routes";

interface IUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

interface IAuthContext {
  user: IUser | null;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: { message: string } | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: { message: string } | null }>;
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
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const user: IUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    : null;

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: { message: data.error || "Registration failed" } };
      }

      return { error: null };
    } catch {
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: { message: "Invalid email or password" } };
    }

    return { error: null };
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: ROUTES.AUTH });
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
