"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/legacy/button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/legacy/card";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { signIn } from "next-auth/react";

export function EmailAndPassword({
  email,
  setEmail,
  password,
  setPassword,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}) {
  return (
    <>
      <Input
        label="Email"
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </>
  );
}

interface SignInFormProps {
  onToggleMode: () => void;
}

export default function SignInForm({ onToggleMode }: SignInFormProps) {
  const { signIn: signInWithCredentials } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWalletSignIn = async () => {
    if (!address || !chain) return;
    setLoading(true);
    try {
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error(`Nonce request failed (${nonceRes.status})`);
      const { nonce } = await nonceRes.json();
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Solstice",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
        nonce,
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
        account: address,
      });
      const result = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
      if (result?.error) {
        toast({
          title: "Error",
          description: "Wallet sign-in failed.",
          variant: "destructive",
        });
      } else {
        router.push(ROUTES.HOME);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const cancelled = message.toLowerCase().includes("user rejected") ||
        message.toLowerCase().includes("cancelled") ||
        message.toLowerCase().includes("denied");
      toast({
        title: cancelled ? "Cancelled" : "Error",
        description: cancelled ? "Wallet sign-in was cancelled." : message,
        variant: cancelled ? "default" : "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithCredentials(email, password);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        router.push(ROUTES.HOME);
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
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailAndPassword
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
        <div className="mt-4 border-t pt-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Quick login (dev only)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const result = await signInWithCredentials(
                    "user@test.com",
                    "password123"
                  );
                  if (result.error) {
                    toast({
                      title: "Login failed",
                      description: `${result.error.message}. Run 'npm run db:seed' to create test users.`,
                      variant: "destructive",
                    });
                  } else {
                    router.push(ROUTES.HOME);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              Login as User
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const result = await signInWithCredentials(
                    "manager@test.com",
                    "password123"
                  );
                  if (result.error) {
                    toast({
                      title: "Login failed",
                      description: `${result.error.message}. Run 'npm run db:seed' to create test users.`,
                      variant: "destructive",
                    });
                  } else {
                    router.push(ROUTES.HOME);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              Login as Manager
            </Button>
          </div>
        </div>
        )}

        <div className="mt-4 border-t pt-4 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Or sign in with a wallet
          </p>
          <div className="flex flex-col items-center gap-2">
            <ConnectButton />
            {isConnected && (
              <Button
                type="button"
                className="w-full"
                variant="outline"
                disabled={loading}
                onClick={handleWalletSignIn}
              >
                Sign in with Wallet
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={onToggleMode}>
            Don't have an account? Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
