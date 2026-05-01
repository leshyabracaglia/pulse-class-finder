"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import AuthProvider from "@/providers/AuthProvider";
import ClassesProvider from "@/providers/ClassesProvider";
import OrganizationProvider from "@/providers/OrganizationProvider";
import { Toaster } from "@/components/ui/legacy/toaster";
import { Toaster as Sonner } from "@/components/ui/legacy/sonner";
import { wagmiConfig } from "@/lib/wagmi";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={{ appName: "Solstice", learnMoreUrl: "https://solstice.fit" }}>
          <SessionProvider>
            <AuthProvider>
              <ClassesProvider>
                <OrganizationProvider>
                  <Toaster />
                  <Sonner />
                  {children}
                </OrganizationProvider>
              </ClassesProvider>
            </AuthProvider>
          </SessionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
