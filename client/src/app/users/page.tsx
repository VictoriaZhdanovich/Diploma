"use client";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useGetTeamsQuery } from "@/state/api";
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
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { PlusSquare, X, Edit, Trash, Eye, EyeOff } from "lucide-react";
import { Role, Team, User } from "@/state/api";

// Интерфейс для строки DataGrid
interface UserRow extends User {
  teams: Team[] | undefined;
  currentUser: any; // Добавляем текущего пользователя для проверки роли
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditUser: React.Dispatch<React.SetStateAction<{
    userId: number;
    username: string;
    role: Role;
    teamId: string;
    profilePictureUrl: string;
  }>>;
  handleDeleteUser: (userId: number) => Promise<void>;
}

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
        Добавить пользователя
      </button>
    )}
  </GridToolbarContainer>
);

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const currentUser = useAppSelector((state) => state.global.currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Новое состояние для видимости пароля
  const [newUser, setNewUser] = useState({
    username: "",
    role: Role.SupportStaff,
    teamId: "",
    profilePictureUrl: "",
    password: "",
  });
  const [editUser, setEditUser] = useState({
    userId: 0,
    username: "",
    role: Role.SupportStaff,
    teamId: "",
    profilePictureUrl: "",
  });

  // Определяем базовые столбцы
  const baseColumns: GridColDef<UserRow>[] = [
    { field: "userId", headerName: "ID", width: 100 },
    { field: "username", headerName: "Username", width: 150 },
    {
      field: "profilePictureUrl",
      headerName: "Profile Picture",
      width: 100,
      renderCell: (params) => (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-9 w-9">
            <Image
              src={params.value || ""}
              alt={params.row.username}
              width={100}
              height={50}
              className="h-full rounded-full object-cover"
            />
          </div>
        </div>
      ),
    },
    { field: "role", headerName: "Role", width: 150 },
    {
      field: "teamId",
      headerName: "Team",
      width: 150,
      renderCell: (params) => {
        const team = params.row.teams?.find((t) => t.id === params.row.teamId);
        return <span>{team ? team.teamName : "No Team"}</span>;
      },
    },
  ];

  // Добавляем столбец "actions" только для администратора
  const columns: GridColDef<UserRow>[] = currentUser?.role === "Administrator" ? [
    ...baseColumns,
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        const { currentUser, setIsEditModalOpen, setEditUser, handleDeleteUser } = params.row;
        // Отображаем кнопки только для администратора (хотя это уже проверено на уровне columns)
        if (currentUser?.role !== "Administrator") {
          return null;
        }
        return (
          <div className="flex gap-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setEditUser({
                  userId: params.row.userId,
                  username: params.row.username,
                  role: params.row.role,
                  teamId: params.row.teamId?.toString() || "",
                  profilePictureUrl: params.row.profilePictureUrl || "",
                });
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteUser(params.row.userId)}
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ] : baseColumns;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Простая валидация пароля
    if (newUser.password.length < 8) {
      alert("Пароль должен содержать как минимум 8 символов.");
      return;
    }
    try {
      const response = await createUser({
        username: newUser.username,
        role: newUser.role,
        teamId: newUser.teamId ? parseInt(newUser.teamId) : undefined,
        profilePictureUrl: newUser.profilePictureUrl || undefined,
        password: newUser.password,
      }).unwrap();
      setIsModalOpen(false);
      setNewUser({ username: "", role: Role.SupportStaff, teamId: "", profilePictureUrl: "", password: "" });
      setShowPassword(false); // Сбрасываем состояние видимости пароля
      alert(response.message || "Пользователь успешно создан!");
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      alert("Ошибка при создании пользователя. Проверьте консоль для деталей.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Проверяем, что текущий пользователь — администратор
    if (currentUser?.role !== "Administrator") {
      alert("У вас нет прав для редактирования пользователей. Только администратор может выполнять это действие.");
      return;
    }
    try {
      const response = await updateUser({
        userId: editUser.userId,
        username: editUser.username,
        role: editUser.role,
        teamId: editUser.teamId ? parseInt(editUser.teamId) : undefined,
        profilePictureUrl: editUser.profilePictureUrl || undefined,
      }).unwrap();
      setIsEditModalOpen(false);
      setEditUser({ userId: 0, username: "", role: Role.SupportStaff, teamId: "", profilePictureUrl: "" });
      alert(response.message || "Пользователь успешно обновлён!");
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      alert("Ошибка при обновлении пользователя. Проверьте консоль для деталей.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Проверяем, что текущий пользователь — администратор
    if (currentUser?.role !== "Administrator") {
      alert("У вас нет прав для удаления пользователей. Только администратор может выполнять это действие.");
      return;
    }
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        const response = await deleteUser(userId).unwrap();
        alert(response.message || "Пользователь успешно удалён!");
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        alert("Ошибка при удалении пользователя. Проверьте консоль для деталей.");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !users) return <div>Error fetching users</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={users.map(user => ({
            ...user,
            teams,
            currentUser, // Передаём текущего пользователя в каждую строку
            setIsEditModalOpen,
            setEditUser,
            handleDeleteUser,
          }))}
          columns={columns}
          getRowId={(row) => row.userId}
          pagination
          slots={{
            toolbar: () => <CustomToolbar currentUser={currentUser} setIsModalOpen={setIsModalOpen} />,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>

      {/* Модальное окно для создания */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Добавить пользователя</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-6 w-6 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-white">Имя пользователя</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium dark:text-white">Пароль</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gra-600 dark:text-white"
                  required
                  placeholder="Введите пароль (мин. 8 символов)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-9 text-gray-500 dark:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Роль</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={Role.SupportStaff}>SupportStaff</option>
                  <option value={Role.Administrator}>Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Команда (опционально)</label>
                <select
                  value={newUser.teamId}
                  onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  {isTeamsLoading ? (
                    <option disabled>Загрузка команд...</option>
                  ) : (
                    teams?.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">URL фото профиля (опционально)</label>
                <input
                  type="text"
                  value={newUser.profilePictureUrl}
                  onChange={(e) => setNewUser({ ...newUser, profilePictureUrl: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/image.png"
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingUser}
                className="w-full flex justify-center rounded-md px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 disabled:opacity-50"
              >
                {isCreatingUser ? "Создание..." : "Создать пользователя"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно для редактирования */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Редактировать пользователя</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="h-6 w-6 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-white">Имя пользователя</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Роль</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Role })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={Role.SupportStaff}>SupportStaff</option>
                  <option value={Role.Administrator}>Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">Команда (опционально)</label>
                <select
                  value={editUser.teamId}
                  onChange={(e) => setEditUser({ ...editUser, teamId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  {isTeamsLoading ? (
                    <option disabled>Загрузка команд...</option>
                  ) : (
                    teams?.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">URL фото профиля (опционально)</label>
                <input
                  type="text"
                  value={editUser.profilePictureUrl}
                  onChange={(e) => setEditUser({ ...editUser, profilePictureUrl: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/image.png"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingUser}
                className="w-full flex justify-center rounded-md px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 disabled:opacity-50"
              >
                {isUpdatingUser ? "Обновление..." : "Обновить пользователя"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;