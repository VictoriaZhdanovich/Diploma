'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import { useGetAuthUserQuery } from '@/state/api';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: authUserData, isLoading, error } = useGetAuthUserQuery(undefined, {
    skip: pathname === '/login' || pathname === '/change-password',
  });

  const isAuthPage = pathname === '/login' || pathname === '/change-password';

  useEffect(() => {
    if (!isAuthPage && !isLoading && error) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [isAuthPage, isLoading, error, router]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (isLoading && !isAuthPage) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {!isAuthPage && <Sidebar />}
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed || isAuthPage ? '' : 'md:pl-64'
        }`}
      >
        {!isAuthPage && <Navbar />}
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;