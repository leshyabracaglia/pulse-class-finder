
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm mode={mode} onToggleMode={toggleMode} />
    </div>
  );
};

export default Auth;
