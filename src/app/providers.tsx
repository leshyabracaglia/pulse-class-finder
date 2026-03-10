"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "@/providers/AuthProvider";
import ClassesProvider from "@/providers/ClassesProvider";
import OrganizationProvider from "@/providers/OrganizationProvider";
import { Toaster } from "@/components/ui/legacy/toaster";
import { Toaster as Sonner } from "@/components/ui/legacy/sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ClassesProvider>
            <OrganizationProvider>
              <Toaster />
              <Sonner />
              {children}
            </OrganizationProvider>
          </ClassesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
