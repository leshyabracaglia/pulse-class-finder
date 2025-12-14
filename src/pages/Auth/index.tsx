import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import AuthForm from "@/pages/Auth/AuthForm";
import { ROUTES } from "@/App";
import { AUTH_MODES, IAuthMode } from "./types";

export default function Auth() {
  const { user } = useAuthContext();

  const [mode, setMode] = useState<IAuthMode>(AUTH_MODES.SIGNIN);

  useEffect(() => {
    if (user) {
      window.location.href = ROUTES.HOME;
    }
  }, [user]);

  const toggleMode = () => {
    setMode(mode === AUTH_MODES.SIGNIN ? AUTH_MODES.SIGNUP : AUTH_MODES.SIGNIN);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm mode={mode} onToggleMode={toggleMode} />
    </div>
  );
}
