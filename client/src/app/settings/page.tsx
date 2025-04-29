"use client";

import Header from "@/components/Header";
import Image from "next/image";
import React from "react";
import { useAppSelector } from "../redux";
import { useGetAuthUserQuery, useGetTeamQuery } from "@/state/api";

const Settings = () => {
  const { data: authUserData, isLoading, isError } = useGetAuthUserQuery(undefined);
  const currentUser = useAppSelector((state) => state.global.currentUser);

  // Проверяем, что teamId существует и является числом
  const teamId =
    currentUser && currentUser.teamId !== null && currentUser.teamId !== undefined
      ? currentUser.teamId
      : null;

  // Вызываем useGetTeamQuery только если teamId — это число
  const { data: teamData, isLoading: isTeamLoading, isError: isTeamError } = useGetTeamQuery(
    teamId as number, // TypeScript теперь знает, что teamId — это number
    { skip: !teamId } // Пропускаем запрос, если teamId отсутствует
  );

  const labelStyles = "block text-sm font-medium dark:text-white";
  const textStyles =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white";

  if (isLoading) return <div>Loading...</div>;
  if (isError || !authUserData) return <div>Error fetching user data</div>;

  return (
    <div className="p-8">
      <Header name="Аккаунт" />
      <div className="space-y-4">
        {/* Фотография профиля и основная информация */}
        <div className="flex items-center gap-4">
          {currentUser?.profilePictureUrl ? (
            <Image
              src={currentUser.profilePictureUrl}
              alt={currentUser.username || "Фотография профиля"}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Нет фото</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              {currentUser?.username || "N/A"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser?.role || "N/A"}
            </p>
          </div>
        </div>
        {/* Детальная информация */}
        <div>
          <label className={labelStyles}>Имя пользователя</label>
          <div className={textStyles}>{currentUser?.username || "N/A"}</div>
        </div>
        <div>
          <label className={labelStyles}>Команда</label>
          <div className={textStyles}>
            {isTeamLoading
              ? "Загрузка..."
              : isTeamError
              ? "Ошибка загрузки команды"
              : teamData?.teamName || "N/A"}
          </div>
        </div>
        <div>
          <label className={labelStyles}>Роль</label>
          <div className={textStyles}>{currentUser?.role || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;