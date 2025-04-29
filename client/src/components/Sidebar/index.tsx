"use client";
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import { AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Home, Layers3, LockIcon, LucideIcon, Search, Settings, ShieldAlert, User, Users, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { useGetProjectsQuery } from '@/state/api';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Type guard для проверки FetchBaseQueryError
const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
    return (error as FetchBaseQueryError).status !== undefined;
};

const Sidebar = () => {
    const [showProjects, setShowProjects] = useState(true);
    const [showPriority, setShowPriority] = useState(true);

    const { data: projects, isLoading, isError, error } = useGetProjectsQuery();

    console.log("Projects data:", projects);
    console.log("showProjects:", showProjects);

    const dispatch = useAppDispatch();
    const isSidebarCollapsed = useAppSelector(
        (state) => state.global.isSidebarCollapsed
    );

    const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white
    ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
    `;

    return (
        <div className={sidebarClassNames}>
            <div className="flex h-[100%] w-full flex-col justify-start">
                {/* top logo */}
                <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                        GoKanban
                    </div>
                    {isSidebarCollapsed ? null : (
                        <button
                            className="py-3"
                            onClick={() => {
                                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
                            }}
                        >
                            <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
                        </button>
                    )}
                </div>
                {/* team */}
                <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} />
                    <div>
                        <h3 className="text-md font-bold tracking-widest dark:text-gray-200">
                            MY TEAM
                        </h3>
                        <div className="mt-1 flex items-start gap-2">
                            <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <p className="text-xs text-gray-500">Private</p>
                        </div>
                    </div>
                </div>
                {/* navbar links */}
                <nav className="z-10 w-full">
                    <SidebarLink icon={Home} label="Главная" href="/" />
                    <SidebarLink icon={Briefcase} label="Таймлайн" href="/timeline" />
                    <SidebarLink icon={Search} label="Поиск" href="/search" />
                    <SidebarLink icon={Settings} label="Аккаунт" href="/settings" />
                    <SidebarLink icon={User} label="Пользователи" href="/users" />
                    <SidebarLink icon={Users} label="Команды" href="/teams" />
                </nav>

                {/* PROJECTS LINKS */}
                <button
                    onClick={() => setShowProjects((prev) => !prev)}
                    className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
                >
                    <span className="">Проекты</span>
                    {showProjects ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </button>
                {/* PROJECTS LIST */}
                {showProjects && (
                    <>
                        {isLoading && <div className="px-8 py-3 text-gray-500">Загрузка проектов...</div>}
                        {isError && (
                            <div className="px-8 py-3 text-red-500">
                                Ошибка загрузки проектов: {isFetchBaseQueryError(error) && error.status === "PARSING_ERROR"
                                    ? `Сервер вернул некорректный ответ. Детали: ${JSON.stringify(error)}`
                                    : JSON.stringify(error)}
                            </div>
                        )}
                        {!isLoading && !isError && projects?.length === 0 && (
                            <div className="px-8 py-3 text-gray-500">Проекты отсутствуют</div>
                        )}
                        {projects?.map((project) => (
                            <SidebarLink
                                key={project.id}
                                icon={Briefcase}
                                label={project.name}
                                href={`/projects/${project.id}`}
                            />
                        ))}
                    </>
                )}

                {/* PRIORITIES LINKS */}
                <button
                    onClick={() => setShowPriority((prev) => !prev)}
                    className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
                >
                    <span className="">Приоритет</span>
                    {showPriority ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </button>
                {showPriority && (
                    <>
                        <SidebarLink
                            icon={AlertCircle}
                            label="Наивысший"
                            href="/priority/urgent"
                        />
                        <SidebarLink
                            icon={ShieldAlert}
                            label="Высокий"
                            href="/priority/high"
                        />
                        <SidebarLink
                            icon={AlertTriangle}
                            label="Средний"
                            href="/priority/medium"
                        />
                        <SidebarLink 
                            icon={AlertOctagon} 
                            label="Низкий" 
                            href="/priority/low" />
                        <SidebarLink
                            icon={Layers3}
                            label="Backlog"
                            href="/priority/backlog"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

const SidebarLink = ({
    href,
    icon: Icon,
    label,
}: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

    return (
        <Link href={href} className="w-full">
            <div
                className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
                    isActive ? "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100" : ""
                } justify-start px-8 py-3`}
            >
                {isActive && (
                    <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-orange-400" />
                )}
                <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
                <span className={`font-medium text-gray-800 dark:text-gray-100`}>
                    {label}
                </span>
            </div>
        </Link>
    );
};

export default Sidebar;