'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { Header } from '@/components/header';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();

  useEffect(() => {
    if (!isLoggedIn || user?.role.id !== 2) {
      router.push('/');
    }
  }, [isLoggedIn, user?.role.id, router]);

  if (!isLoggedIn || user?.role.id !== 2) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DoctorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        <Header 
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={logout}
          onSignIn={openSignIn}
          onSignUp={openSignUp}
          hideMenu={true}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

