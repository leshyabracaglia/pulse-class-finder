"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useAuthContext } from "./providers/AuthProvider";
import { House } from "lucide-react";
import { Button } from "./components/ui/legacy/button";
import { ROUTES } from "./lib/routes";
import { useEffect } from "react";
import { useOrganizationContext } from "./providers/OrganizationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/legacy/dropdown-menu";

function UserMenu() {
  const { user, signOut } = useAuthContext();
  const { organization } = useOrganizationContext();

  if (!user) return null;

  const fullName = user.name;
  const isCompanyAdmin = !!organization;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer border border-solid border-gray-200 rounded-full p-2 px-3">
          <AvatarFallback>{fullName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.PROFILE}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.DASHBOARD}>User Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isCompanyAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ORGANIZATION_SETTINGS}>
                Organization Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ORGANIZATION_CLASSES}>Organization Classes</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.CREATE_ORGANIZATION}>Create Organization</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 flex-row justify-between">
        <Link href={ROUTES.HOME}>
          <Button variant="ghost" size="icon">
            <House />
          </Button>
        </Link>
        <UserMenu />
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { organization, fetchOrganization } = useOrganizationContext();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user && !organization) {
      fetchOrganization();
    }
  }, [user, fetchOrganization, organization, loading]);

  return (
    <div className="min-h-screen flex w-full">
      <main className="flex-1">
        <AppHeader />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
