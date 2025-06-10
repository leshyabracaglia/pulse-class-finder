import { Calendar, Building, User, LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const USER_MENU_ITEMS = [
  {
    title: "Classes",
    url: "/",
    icon: Calendar,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: User,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: Settings,
  },
];

const COMPANY_MENU_ITEMS = [
  {
    title: "Classes",
    url: "/",
    icon: Calendar,
  },
  {
    title: "Company Dashboard",
    url: "/company-dashboard",
    icon: Building,
  },
  {
    title: "Company Profile",
    url: "/company-profile",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user, signOut, isCompany } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const menuItems = isCompany ? COMPANY_MENU_ITEMS : USER_MENU_ITEMS;

  if (!user) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="p-4">
            <h2 className="text-lg font-semibold">Fitness Studio</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation("/")}
                    isActive={location.pathname === "/"}
                  >
                    <Calendar />
                    <span>Classes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation("/auth")}
                    isActive={location.pathname === "/auth"}
                  >
                    <User />
                    <span>Sign In</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Fitness Studio</h2>
          <p className="text-sm text-muted-foreground">
            {isCompany ? "Company Account" : "User Account"}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={location.pathname === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
