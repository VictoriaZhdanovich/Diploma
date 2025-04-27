import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
    id: number;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export enum Priority {
    Urgent = "Наивысший",
    High = "Высокий",
    Medium = "Средний",
    Low = "Низкий",
    Backlog = "Backlog",
}

export enum Status {
    ToDo = "Новая",
    WorkInProgress = "В работе",
    UnderReview = "На проверке",
    Completed = "Выполнена",
}

export enum Role {
    SupportStaff = "Сотрудник_поддержки",
    Administrator = "Администратор",
}

export interface User {
    id: number;
    username: string;
    profilePictureUrl?: string;
    cognitoId: string;
    teamId?: number | null;
    role: Role;
}

export interface AuthUserResponse {
    userDetails: {
        userId: number;
        username: string;
        profilePictureUrl?: string;
        cognitoId: string;
        teamId?: number | null;
        role: Role;
    };
}

export interface Attachment {
    id: number;
    fileUrl: string;
    fileName: string;
    taskId: number;
    uploadedById: number;
}

export interface Team {
    id: number;
    name: string;
    productOwnerId: number;
    projectManagerId: number;
    description?: string;
    users?: User[];
}

export interface SearchResults {
    projects?: Project[];
    tasks?: Task[];
    users?: User[];
    teams?: Team[];
}

export interface Comment {
    id: number;
    text: string;
    taskId: number;
    userId: number;
    createdAt?: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status?: Status;
    priority?: Priority;
    tags?: string;
    startDate?: string;
    dueDate?: string;
    points?: number;
    projectId: number;
    authorUserId?: number;
    assignedUserId?: number;
    author?: User;
    assignee?: User;
    comments?: Comment[];
    attachments?: Attachment[];
}

// Интерфейсы для входа
interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    user: User;
    token: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: (headers) => {
            console.log("Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
            // Добавляем токен авторизации в заголовки, если он есть
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        fetchFn: async (input, init) => {
            console.log("Sending request to:", input);
            const response = await fetch(input, init);
            console.log("Response status:", response.status);
            return response;
        },
    }),
    reducerPath: "api",
    tagTypes: ["Projects", "Tasks", "Teams", "Users"],
    endpoints: (build) => ({
        // Эндпоинт для входа
        login: build.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        getProjects: build.query<Project[], void>({
            query: () => "project",
            providesTags: ["Projects"],
        }),

        createProject: build.mutation<Project, Partial<Project>>({
            query: (project) => ({
                url: "project",
                method: "POST",
                body: project,
            }),
            invalidatesTags: ["Projects"],
        }),

        // Обновляем getTasks для поддержки фильтрации по userId
        getTasks: build.query<Task[], { projectId?: number; userId?: number }>({
            query: ({ projectId, userId }) => {
                let url = "tasks";
                const params = new URLSearchParams();
                if (projectId) params.append("projectId", projectId.toString());
                if (userId) params.append("userId", userId.toString());
                if (params.toString()) url += `?${params.toString()}`;
                return url;
            },
            providesTags: (result) =>
                result
                    ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
                    : [{ type: "Tasks" as const }],
        }),

        createTask: build.mutation<Task, Partial<Task>>({
            query: (task) => ({
                url: "tasks",
                method: "POST",
                body: task,
            }),
            invalidatesTags: ["Tasks"],
        }),

        updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
            query: ({ taskId, status }) => ({
                url: `tasks/${taskId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, { taskId }) => [
                { type: "Tasks" as const, id: taskId },
            ],
        }),

        getTeams: build.query<Team[], void>({
            query: () => "teams",
            providesTags: ["Teams"],
        }),

        search: build.query<SearchResults, string>({
            query: (query) => `search?query=${query}`,
        }),

        getTasksByUser: build.query<Task[], { userId: number }>({
            query: ({ userId }) => `tasks/user/${userId}`,
            providesTags: (result) =>
                result
                    ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
                    : [{ type: "Tasks" as const }],
        }),

        getAuthUser: build.query<AuthUserResponse, void>({
            query: () => "auth/user",
            providesTags: ["Users"],
        }),

        getUsers: build.query<User[], void>({
            query: () => "users",
            providesTags: ["Users"],
        }),

        // Добавим эндпоинты для создания команды и пользователя (для администратора)
        createTeam: build.mutation<Team, Partial<Team>>({
            query: (team) => ({
                url: "teams",
                method: "POST",
                body: team,
            }),
            invalidatesTags: ["Teams"],
        }),

        createUser: build.mutation<User, Partial<User>>({
            query: (user) => ({
                url: "users",
                method: "POST",
                body: user,
            }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useCreateProjectMutation,
    useGetTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskStatusMutation,
    useSearchQuery,
    useGetTeamsQuery,
    useGetTasksByUserQuery,
    useGetAuthUserQuery,
    useGetUsersQuery,
    useLoginMutation,
    useCreateTeamMutation,
    useCreateUserMutation,
} = api;