
import { Calendar, Home, Building, User, Package, LogOut, Settings } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      setIsCompany(!!data);
    };

    checkUserType();
  }, [user]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const userMenuItems = [
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

  const companyMenuItems = [
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

  const menuItems = isCompany ? companyMenuItems : userMenuItems;

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
