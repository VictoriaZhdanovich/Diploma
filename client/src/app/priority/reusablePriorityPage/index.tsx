// client/src/components/ReusablePriorityPage.tsx
"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

type Props = {
  priority: Priority;
};

// Маппинг русских значений Priority для фильтрации (теперь тоже на русском)
const priorityFilterMap: { [key: string]: string } = {
  "Наивысший": "Наивысший",
  "Высокий": "Высокий",
  "Средний": "Средний",
  "Низкий": "Низкий",
  "Backlog": "Backlog",
};

// Маппинг для отображения (теперь тоже на русском, можно упростить)
const priorityDisplayMap: { [key: string]: string } = {
  "Наивысший": "Наивысший",
  "Высокий": "Высокий",
  "Средний": "Средний",
  "Низкий": "Низкий",
  "Backlog": "Backlog",
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Заголовок",
    width: 100,
  },
  {
    field: "description",
    headerName: "Описание",
    width: 200,
  },
  {
    field: "status",
    headerName: "Статус",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value || "Не указан"}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Приоритет",
    width: 75,
    renderCell: (params) => (
      <span>{priorityDisplayMap[params.value] || params.value || "Не указан"}</span>
    ),
  },
  {
    field: "tags",
    headerName: "Тэги",
    width: 130,
    renderCell: (params) => (
      <span>{params.value ? params.value : "Нет тэгов"}</span>
    ),
  },
  {
    field: "startDate",
    headerName: "Дата начала",
    width: 130,
    renderCell: (params) => (
      <span>{params.value ? new Date(params.value).toLocaleDateString() : "Не указана"}</span>
    ),
  },
  {
    field: "dueDate",
    headerName: "Дата окончания",
    width: 130,
    renderCell: (params) => (
      <span>{params.value ? new Date(params.value).toLocaleDateString() : "Не указана"}</span>
    ),
  },
  {
    field: "author",
    headerName: "Создатель",
    width: 150,
    renderCell: (params) => params.value?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Исполнитель",
    width: 150,
    renderCell: (params) => params.value?.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  // Захардкодим userId, так как аутентификация отключена
  const userId = 1; // Victoria Zhdanovich, user_id = 1
  console.log("User ID:", userId);

  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
  } = useGetTasksByUserQuery({ userId }, { 
    skip: userId === null,
  });
  console.log("Raw tasks from server:", tasks);
  console.log("Tasks loading:", isTasksLoading, "Tasks error:", isTasksError, tasksError);

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Фильтруем задачи, с учётом регистра
  const filteredTasks = tasks?.filter((task: Task) => 
    task.priority?.toLowerCase() === priorityFilterMap[priority].toLowerCase()
  ) || [];
  console.log("Filtered tasks:", filteredTasks);

  if (isTasksLoading) return <div>Loading...</div>;

  if (isTasksError) return <div>Error fetching tasks: {JSON.stringify(tasksError)}</div>;
  if (!tasks) return <div>No tasks found</div>;

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name={`Приоритет: ${priority}`}
        buttonComponent={
          <button
            className="mr-3 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Добавить задачу
          </button>
        }
      />
      <div className="mb-4 flex justify-start">
        <button
          className={`px-4 py-2 ${view === "list" ? "bg-gray-300" : "bg-white"} rounded-l`}
          onClick={() => setView("list")}
        >
          Список
        </button>
        <button
          className={`px-4 py-2 ${view === "table" ? "bg-gray-300" : "bg-white"} rounded-r`}
          onClick={() => setView("table")}
        >
          Таблица
        </button>
      </div>
      {filteredTasks.length === 0 ? (
        <div>Задачи с приоритетом {priority} не найдены</div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="z-0 w-full">
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            checkboxSelection
            getRowId={(row) => row.id}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      )}
    </div>
  );
};

export default ReusablePriorityPage;