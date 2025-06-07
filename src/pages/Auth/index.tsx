import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import AuthForm from "@/pages/Auth/AuthForm";

export default function Auth() {
  const { user } = useAuthContext();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm mode={mode} onToggleMode={toggleMode} />
    </div>
  );
}
