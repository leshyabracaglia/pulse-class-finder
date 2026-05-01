"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/routes";
import { AUTH_MODES, IAuthMode } from "./types";
import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";
import { useRouter } from "next/navigation";

export default function Auth() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [mode, setMode] = useState<IAuthMode>(AUTH_MODES.SIGNIN);

  useEffect(() => {
    if (user) {
      router.push(ROUTES.HOME);
    }
  }, [user, router]);

  const toggleMode = () => {
    setMode(mode === AUTH_MODES.SIGNIN ? AUTH_MODES.SIGNUP : AUTH_MODES.SIGNIN);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-10">SOLSTICE</p>
      {mode === AUTH_MODES.SIGNIN ? (
        <SignInForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </div>
  );
}
