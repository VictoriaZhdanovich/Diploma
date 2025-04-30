"use client";

import { useGetTeamsQuery, useCreateTeamMutation, useGetUsersQuery } from "@/state/api";
import React, { useState } from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { PlusSquare, X } from "lucide-react";

const CustomToolbar = ({ currentUser, setIsModalOpen }: { currentUser: any; setIsModalOpen: (open: boolean) => void }) => (
  <GridToolbarContainer className="toolbar flex items-center justify-between gap-2">
    <div className="flex gap-2">
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </div>
    {currentUser?.role === "Administrator" && (
      <button
        className="flex items-center rounded-md px-3 py-2 text-white bg-orange-400 hover:bg-orange-500"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusSquare className="mr-2 h-5 w-5" />
        Добавить команду
      </button>
    )}
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "Номер", width: 100 },
  { field: "teamName", headerName: "Название команды", width: 200 },
  {
    field: "productOwner",
    headerName: "Создатель команды",
    width: 200,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {params.value?.profilePictureUrl ? (
          <img
            src={params.value.profilePictureUrl}
            alt={params.value.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{params.value?.username?.charAt(0) || "N/A"}</span>
          </div>
        )}
        <span>{params.value?.username || "N/A"}</span>
      </div>
    ),
  },
  {
    field: "projectManager",
    headerName: "Руководитель команды",
    width: 200,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {params.value?.profilePictureUrl ? (
          <img
            src={params.value.profilePictureUrl}
            alt={params.value.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{params.value?.username?.charAt(0) || "N/A"}</span>
          </div>
        )}
        <span>{params.value?.username || "N/A"}</span>
      </div>
    ),
  },
  {
    field: "teamMembers",
    headerName: "Участники команды",
    width: 300,
    renderCell: (params) => (
      <div className="flex flex-wrap gap-2">
        {params.value && params.value.length > 0 ? (
          params.value.map((member: { username: string; profilePictureUrl?: string }, index: number) => (
            <div key={index} className="flex items-center gap-1">
              {member.profilePictureUrl ? (
                <img
                  src={member.profilePictureUrl}
                  alt={member.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">{member.username.charAt(0)}</span>
                </div>
              )}
              <span>{member.username}</span>
            </div>
          ))
        ) : (
          "No members"
        )}
      </div>
    ),
  },
];

const Teams = () => {
  const { data: teams, isLoading: isTeamsLoading, isError: isTeamsError } = useGetTeamsQuery();
  const { data: users, isLoading: isUsersLoading } = useGetUsersQuery(); // Запрашиваем пользователей для выпадающих списков
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const currentUser = useAppSelector((state) => state.global.currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    productOwnerId: "",
    projectManagerId: "",
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createTeam({
        teamName: newTeam.teamName,
        productOwnerId: parseInt(newTeam.productOwnerId),
        projectManagerId: parseInt(newTeam.projectManagerId),
      }).unwrap();
      setIsModalOpen(false);
      setNewTeam({ teamName: "", productOwnerId: "", projectManagerId: "" });
      alert(response.message || "Команда успешно создана!");
    } catch (error) {
      console.error("Ошибка при создании команды:", error);
      alert("Ошибка при создании команды. Проверьте консоль для деталей.");
    }
  };

  if (isTeamsLoading) return <div>Loading...</div>;
  if (isTeamsError || !teams) return <div>Error fetching data</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Команды" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={teams || []}
          columns={columns}
          pagination
          slots={{
            toolbar: () => <CustomToolbar currentUser={currentUser} setIsModalOpen={setIsModalOpen} />,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Добавить команду</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-6 w-6 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-white">Название команды</label>
                <input
                  type="text"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Product Owner</label>
                <select
                  value={newTeam.productOwnerId}
                  onChange={(e) => setNewTeam({ ...newTeam, productOwnerId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Выберите Product Owner</option>
                  {isUsersLoading ? (
                    <option disabled>Загрузка пользователей...</option>
                  ) : (
                    users?.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.username}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Project Manager</label>
                <select
                  value={newTeam.projectManagerId}
                  onChange={(e) => setNewTeam({ ...newTeam, projectManagerId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Выберите Project Manager</option>
                  {isUsersLoading ? (
                    <option disabled>Загрузка пользователей...</option>
                  ) : (
                    users?.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.username}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                type="submit"
                disabled={isCreatingTeam}
                className="w-full flex justify-center rounded-md px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 disabled:opacity-50"
              >
                {isCreatingTeam ? "Создание..." : "Создать команду"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;