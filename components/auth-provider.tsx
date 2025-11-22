'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SignInModal } from './modals/sign-in-modal';
import { SignUpModal } from './modals/sign-up-modal';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  openSignIn: () => void;
  openSignUp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const openSignIn = () => {
    setSignUpOpen(false);
    setSignInOpen(true);
  };

  const openSignUp = () => {
    setSignInOpen(false);
    setSignUpOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      openSignIn,
      openSignUp,
    }}>
      {children}
      <SignInModal 
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSuccess={login}
        onSwitchToSignUp={openSignUp}
      />
      <SignUpModal 
        isOpen={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSuccess={login}
        onSwitchToSignIn={openSignIn}
      />
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
