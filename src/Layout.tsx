import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useAuthContext } from "./providers/AuthProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { House } from "lucide-react";
import { Button } from "./components/ui/button";
import { ROUTES } from "./App";
import { useEffect } from "react";
import { useOrganizationContext } from "./providers/OrganizationProvider";

function UserAvatar() {
  const { user, signOut } = useAuthContext();
  const { organization } = useOrganizationContext();

  if (!user) return null;

  const fullName = user?.identities?.[0]?.identity_data?.full_name;
  const isCompanyAdmin = !!organization;

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="cursor-pointer border border-solid border-gray-200 rounded-full p-2 px-3">
          {/* <AvatarImage src={user?.} /> */}
          <AvatarFallback>{fullName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <h1>{fullName}</h1>
          <p>{user?.email}</p>
          <p>isCompanyAdmin: {isCompanyAdmin ? "Yes" : "No"}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/profile">Profile</Link>
          {isCompanyAdmin && (
            <>
              <Link to="/company-dashboard">Company Dashboard</Link>
              <Link to="/company-profile">Company Profile</Link>
            </>
          )}
          <Link to="/dashboard">User Dashboard</Link>
          <Link to="/">Classes</Link>
          <div className="cursor-pointer" onClick={signOut}>
            Logout
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AppHeader() {
  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 flex-row justify-between">
        <Link to={ROUTES.HOME}>
          <Button variant="ghost" size="icon">
            <House />
          </Button>
        </Link>
        <UserAvatar />
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();

  const location = useLocation();

  const isAuthPage = location.pathname === ROUTES.AUTH;

  useEffect(() => {
    if (!isAuthPage && !user && !loading) {
      console.log("User is not logged in, redirecting to auth page");
      window.location.href = ROUTES.AUTH;
    }
  }, [user, isAuthPage, loading]);

  return (
    <div className="min-h-screen flex w-full">
      <main className="flex-1">
        {!isAuthPage && <AppHeader />}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
