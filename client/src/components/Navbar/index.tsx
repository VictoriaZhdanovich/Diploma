// client/src/components/Navbar/index.tsx
"use client";

import React from 'react';
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react"; // Добавили иконку User
import Link from "next/link";
import Image from "next/image"; // Импортируем Image из next/image
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';

// Предполагаем, что у вас есть тип для пользователя в state/api.ts
interface UserDetails {
  username: string;
  profilePictureUrl?: string;
}

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Получаем данные текущего пользователя из Redux (настройте путь в зависимости от вашей структуры состояния)
  const currentUserDetails = useAppSelector((state) => state.global.currentUser) as UserDetails | null;

  // Заглушка для функции выхода (замените на вашу логику выхода)
  const handleSignOut = () => {
    console.log("Пользователь вышел из системы");
    // Добавьте вашу логику выхода, например, очистка токенов, перенаправление и т.д.
    // Пример: localStorage.removeItem("token");
    // window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black dark:px-4 dark:py-3">
      {/* Панель поиска */}
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
      {/* Объединяем иконки и разделитель в один блок */}
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
          <Link
            href="/settings"
            className={
              isDarkMode
                ? `h-min w-min rounded p-2 dark:hover:bg-gray-700`
                : `h-min w-min rounded p-2 hover:bg-gray-100`
            }
          >
            <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
          </Link>
        </div>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        <div className="hidden items-center justify-between md:flex">
          <div className="align-center flex h-9 w-9 justify-center">
            {currentUserDetails?.profilePictureUrl ? (
              <Image
                src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${currentUserDetails.profilePictureUrl}`}
                alt={currentUserDetails.username || "Фотография профиля пользователя"}
                width={36} // Соответствует h-9 (36px)
                height={36} // Соответствует h-9 (36px)
                className="h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
            )}
          </div>
          <span className="mx-3 text-gray-800 dark:text-white">
            {currentUserDetails?.username || "Гость"}
          </span>
          <button
            className="hidden rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
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