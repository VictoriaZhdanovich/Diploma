// client/src/app/home/page.tsx
"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Название", width: 200 },
  { field: "status", headerName: "Статус", width: 150 },
  { field: "priority", headerName: "Приоритет", width: 150 },
  {
    field: "dueDate",
    headerName: "Дата выполнения",
    width: 150,
    renderCell: (params) => formatDate(params.value as string),
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({ projectId: parseInt("1") });
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksLoading || isProjectsLoading) return <div>Загрузка...</div>;
  if (tasksError || !tasks || !projects)
    return <div>Ошибка при загрузке данных</div>;

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const priority = task.priority || "Не указан"; // Добавляем значение по умолчанию
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key, // Используем значение напрямую, так как Priority уже на русском
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Завершён" : "Активен";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-100 p-8">
      <Header name="Дашборд" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Распределение задач по приоритету
          </h3>
          {taskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#333" : "#fff",
                    border: "none",
                    color: chartColors.text,
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "count" ? "Количество" : value
                  }
                />
                <Bar dataKey="count" fill={chartColors.bar} name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Нет данных для отображения графика.
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Статус проектов
          </h3>
          {projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={projectStatus}
                  label
                  labelLine={true}
                  // label={({ name, percent }) =>
                  //   `${name}: ${(percent * 100).toFixed(0)}%`
                  // }
                >
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#333" : "#fff",
                    border: "none",
                    color: chartColors.text,
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "count" ? "Количество" : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Нет данных для отображения графика.
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Ваши задачи
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;