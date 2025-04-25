import Header from "@/components/Header";
import React from "react";

const Settings = () => {
  const userSettings = {
    username: "Имя",
    teamName: "Команда",
    roleName: "Роль",
  };

  const labelStyles = "block text-sm font-medium dark:text-white";
  const textStyles =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white";

  return (
    <div className="p-8">
      <Header name="Настройки" />
      <div className="space-y-4">
        <div>
          <label className={labelStyles}>Имя пользователя</label>
          <div className={textStyles}>{userSettings.username}</div>
        </div>
        <div>
          <label className={labelStyles}>Команда</label>
          <div className={textStyles}>{userSettings.teamName}</div>
        </div>
        <div>
          <label className={labelStyles}>Роль</label>
          <div className={textStyles}>{userSettings.roleName}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;