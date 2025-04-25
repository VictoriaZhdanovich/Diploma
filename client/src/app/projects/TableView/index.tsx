import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTasksQuery } from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

type Props = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
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
            {params.value}
            </span>
        ),
        },
        {
        field: "priority",
        headerName: "Приоритет",
        width: 75,
        },
        {
        field: "tags",
        headerName: "Тэги",
        width: 130,
        },
        {
        field: "startDate",
        headerName: "Дата начала",
        width: 130,
        },
        {
        field: "dueDate",
        headerName: "Дата  окончания",
        width: 130,
        },
        {
        field: "author",
        headerName: "Создатель",
        width: 150,
        renderCell: (params) => params.value?.username || "Неизвестно",
        },
        {
        field: "assignee",
        headerName: "Исполнитель",
        width: 150,
        renderCell: (params) => params.value?.username || "Не назначено",
        },
    ];

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
        const {
            data: tasks,
            error,
            isLoading,
        } = useGetTasksQuery({ projectId: Number(id) });
        if (isLoading) return <div>Loading...</div>
        if (error) return <div>При выборке задач произошла ошибка</div>

    
return (
        <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
        <div className="pt-5">
            <Header
            name="Таблица"
            buttonComponent={
                <button
                className="flex items-center rounded bg-blue-primary px-3 py-2 text-white bg-orange-400 hover:bg-orange-500"
                onClick={() => setIsModalNewTaskOpen(true)}
                >
                Добавить задачу
                </button>
            }
            isSmallText
            />
        </div>
        <DataGrid
            rows={tasks || []}
            columns={columns}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
        />
        </div>
    )
}

export default TableView