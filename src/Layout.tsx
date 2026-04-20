"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useAuthContext } from "./providers/AuthProvider";
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
        <Avatar className="cursor-pointer border border-zinc-800 rounded-none p-2 px-3 bg-zinc-900 text-white text-sm font-mono">
          <AvatarFallback className="text-white">
            {fullName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-zinc-950 border-zinc-800 text-white rounded-none"
      >
        <DropdownMenuLabel>
          <div>
            <p className="font-medium text-white">{fullName}</p>
            <p className="text-xs text-zinc-500 font-mono">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild className="hover:bg-zinc-900 cursor-pointer">
          <Link href={ROUTES.PROFILE}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-zinc-900 cursor-pointer">
          <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {isCompanyAdmin ? (
          <>
            <DropdownMenuItem
              asChild
              className="hover:bg-zinc-900 cursor-pointer"
            >
              <Link href={ROUTES.ORGANIZATION_SETTINGS}>Studio Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="hover:bg-zinc-900 cursor-pointer"
            >
              <Link href={ROUTES.ORGANIZATION_CLASSES}>Studio Classes</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            asChild
            className="hover:bg-zinc-900 cursor-pointer"
          >
            <Link href={ROUTES.CREATE_ORGANIZATION}>List Your Studio</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={signOut}
          className="cursor-pointer hover:bg-zinc-900 text-zinc-400"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  return (
    <div className="border-b border-zinc-900 bg-black sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 justify-between">
        <Link
          href={ROUTES.HOME}
          className="text-white font-bold tracking-[0.25em] text-sm uppercase"
        >
          MOVEMINT
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
    <div className="min-h-screen flex w-full bg-black">
      <main className="flex-1">
        <AppHeader />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
