'use client';

import { useAppSelector } from '@/app/redux';
import { useGetTasksQuery } from '@/state/api';
import { DisplayOption, Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import React, { useMemo, useState } from 'react';

type Props = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
    };

    const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const {
        data: tasks,
        error,
        isLoading,
    } = useGetTasksQuery({ projectId: Number(id) });

    const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
        viewMode: ViewMode.Month,
        locale: 'ru-RU',
    });

    const ganttTasks: Task[] = useMemo(() => {
        return (
        tasks?.map((task) => ({
            start: new Date(task.startDate as string),
            end: new Date(task.dueDate as string),
            name: task.title,
            id: `Task-${task.id}`,
            type: 'task', 
            progress: task.points ? (task.points / 10) * 100 : 0,
            isDisabled: false,
        })) || []
        );
    }, [tasks]);

    const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDisplayOptions((prev) => ({
        ...prev,
        viewMode: event.target.value as ViewMode,
        }));
    };

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>При выборке задач произошла ошибка</div>;

    return (
        <div className="px-4 xl:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 py-5">
            <h1 className="me-2 text-lg font-bold dark:text-white">График выполнения задач проекта</h1>
            <div className="relative inline-block w-64">
            <select
                className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
                value={displayOptions.viewMode}
                onChange={handleViewModeChange}
            >
                <option value={ViewMode.Day}>День</option>
                <option value={ViewMode.Week}>Неделя</option>
                <option value={ViewMode.Month}>Месяц</option>
            </select>
            </div>
        </div>
        <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
            <div className="timeline">
            <Gantt
                tasks={ganttTasks}
                {...displayOptions}
                columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
                listCellWidth="100px"
                barBackgroundColor="#F6AE3B"
                barBackgroundSelectedColor="#F6AE3B"
                
            />
            </div>
            <div className="px-4 pb-5 pt-1">
            <button
                className="flex items-center rounded bg-blue-primary px-3 py-2 text-white bg-orange-400 hover:bg-orange-500"
                onClick={() => setIsModalNewTaskOpen(true)}
            >
                Добавить задачу
            </button>
            </div>
        </div>
        </div>
    );
};

export default Timeline;