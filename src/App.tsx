import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthProvider from "@/providers/AuthProvider";
import Classes from "./pages/Classes";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import UserProfile from "./pages/UserProfile";
import CompanyProfile from "./pages/CompanyProfile";
import NotFound from "./pages/NotFound";
import Layout from "./Layout";

export const ROUTES = {
  AUTH: "/",
  HOME: "/home",
  DASHBOARD: "/dashboard",
  COMPANY_DASHBOARD: "/company-dashboard",
  COMPANY_PROFILE: "/company-profile",
  PROFILE: "/profile",
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Layout>
              <Routes>
                <Route path={ROUTES.AUTH} element={<Auth />} />
                <Route path={ROUTES.HOME} element={<Classes />} />
                <Route path={ROUTES.DASHBOARD} element={<UserDashboard />} />
                <Route
                  path={ROUTES.COMPANY_DASHBOARD}
                  element={<CompanyDashboard />}
                />
                <Route path={ROUTES.PROFILE} element={<UserProfile />} />
                <Route
                  path={ROUTES.COMPANY_PROFILE}
                  element={<CompanyProfile />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </SidebarProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
