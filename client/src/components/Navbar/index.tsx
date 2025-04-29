'use client';

import React from 'react';
import { Menu, Moon, Search, Sun, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed, setCurrentUser } from '@/state';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/state/api';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const currentUser = useAppSelector(
    (state) => state.global.currentUser
  ) as UserType | null;

  const handleSignOut = () => {
    localStorage.removeItem('token');
    dispatch(setCurrentUser(null));
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black dark:px-4 dark:py-3">
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Поиск..."
          />
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            className={
              isDarkMode
                ? `rounded p-2 dark:hover:bg-gray-700`
                : `rounded p-2 hover:bg-gray-100`
            }
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
            ) : (
              <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
            )}
          </button>
        </div>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        <div className="hidden items-center justify-between md:flex">
          <div className="align-center flex h-9 w-9 justify-center">
          {currentUser?.profilePictureUrl ? (
  <Image
    src={currentUser.profilePictureUrl} // Уберите префикс S3
    alt={currentUser.username || 'Фотография профиля пользователя'}
    width={36}
    height={36}
    className="h-full rounded-full object-cover"
  />
) : (
  <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
)}
          </div>
          <div className="mx-3 flex flex-col">
            <span className="text-gray-800 dark:text-white">
              {currentUser?.username || 'Гость'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser?.role || ''}
            </span>
          </div>
          <button
            className="hidden rounded bg-orange-400 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500 md:block"
            onClick={handleSignOut}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;