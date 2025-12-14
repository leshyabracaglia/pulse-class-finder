import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_MODES, IAuthMode, IUserType, USER_TYPES } from "./types";
import { ROUTES } from "@/App";

async function createOrganization(companyName: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const organizationUid = crypto.randomUUID();
  const { error: organizationError } = await supabase
    .from("organizations")
    .insert({
      organization_uid: organizationUid,
      name: companyName,
    });

  const { error: organizationAdminError } = await supabase
    .from("organization_admins")
    .insert({
      user_uid: user.id,
      organization_uid: organizationUid,
    });

  if (organizationError || organizationAdminError) {
    return false;
  }

  return true;
}

interface AuthFormProps {
  mode: IAuthMode;
  onToggleMode: () => void;
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { signUp, signIn } = useAuthContext();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<IUserType>(USER_TYPES.USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (mode === AUTH_MODES.SIGNUP) {
        result = await signUp(email, password, fullName);

        if (!result.error && userType === USER_TYPES.COMPANY) {
          // Wait a moment for the user to be created, then create company profile
          setTimeout(async () => {
            try {
              const organizationCreated = await createOrganization(companyName);

              if (!organizationCreated) {
                throw new Error("Failed to create organization");
              }
            } catch (error) {
              console.error("Error in organization creation:", error);
              throw new Error("Failed to create organization");
            }
          }, 2000);
        }
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        if (mode === AUTH_MODES.SIGNUP) {
          toast({
            title: "Success",
            description:
              userType === USER_TYPES.COMPANY
                ? "Company account created! Please check your email to verify your account. Your company will need approval before you can list classes."
                : "Account created! Please check your email to verify your account.",
          });
        } else {
          window.location.href = ROUTES.HOME;
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{mode === "signin" ? "Sign In" : "Sign Up"}</CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Sign in to your account"
            : "Create an account to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "signup" && (
          <Tabs
            value={userType}
            onValueChange={(value) => setUserType(value as IUserType)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">Personal Account</TabsTrigger>
              <TabsTrigger value="company">Company Account</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="mt-4">
              <p className="text-sm text-gray-600">
                Sign up as an individual to book fitness classes
              </p>
            </TabsContent>
            <TabsContent value="company" className="mt-4">
              <p className="text-sm text-gray-600">
                Sign up as a wellness company to list and manage classes
              </p>
            </TabsContent>
          </Tabs>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          {mode === "signup" && userType === "company" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Input
                  id="companyDescription"
                  type="text"
                  placeholder="Brief description of your wellness company"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Company contact email (optional, will use account email if empty)"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Company phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Company address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="Company website (optional)"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={onToggleMode}>
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
