import { Toaster } from "@/components/ui/legacy/toaster";
import { Toaster as Sonner } from "@/components/ui/legacy/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "@/providers/AuthProvider";
import Classes from "./pages/Classes";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import UserProfile from "./pages/UserProfile";
import CompanyProfile from "./pages/CompanyProfile";
import NotFound from "./pages/NotFound";
import Layout from "./Layout";
import OrganizationProvider from "./providers/OrganizationProvider";
import { ROUTES } from "./pages/routes";
import CreateOrganization from "./pages/CreateOrganization";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route
                path={ROUTES.CREATE_ORGANIZATION}
                element={<CreateOrganization />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
