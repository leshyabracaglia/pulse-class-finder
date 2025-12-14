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
import { IUserType, USER_TYPES } from "./types";
import { AuthInput, EmailAndPassword } from "./SignInForm";

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

function UserTypeTabs({
  userType,
  setUserType,
}: {
  userType: IUserType;
  setUserType: (userType: IUserType) => void;
}) {
  return (
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
  );
}

interface SignUpFormProps {
  onToggleMode: () => void;
}

export default function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const { signUp } = useAuthContext();
  const { toast } = useToast();

  const [userType, setUserType] = useState<IUserType>(USER_TYPES.USER);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUp(email, password, fullName);

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

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description:
            userType === USER_TYPES.COMPANY
              ? "Company account created! Please check your email to verify your account. Your company will need approval before you can list classes."
              : "Account created! Please check your email to verify your account.",
        });
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
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <UserTypeTabs userType={userType} setUserType={setUserType} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailAndPassword
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />

          <AuthInput
            label="Full Name"
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {userType === "company" && (
            <>
              <AuthInput
                label="Company Name"
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <AuthInput
                label="Company Description"
                id="companyDescription"
                type="text"
                placeholder="Brief description of your wellness company"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                required
              />
              <AuthInput
                label="Contact Email"
                id="contactEmail"
                type="email"
                placeholder="Company contact email (optional, will use account email if empty)"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required={false}
              />
              <AuthInput
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="Company phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <AuthInput
                label="Address"
                id="address"
                type="text"
                placeholder="Company address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <AuthInput
                label="Website"
                id="website"
                type="url"
                placeholder="Company website (optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required={false}
              />
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={onToggleMode}>
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
