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
    SupportStaff = "SupportStaff",
    Administrator = "Administrator",
}

export interface User {
    userId: number;
    username: string;
    profilePictureUrl?: string | null;
    teamId?: number | null;
    role: Role;
    forcePasswordChange: boolean;
}

export interface AuthUserResponse {
    userDetails: {
        userId: number;
        username: string;
        profilePictureUrl?: string;
        teamId?: number | null;
        role: Role;
        forcePasswordChange: boolean;
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
    teamName: string;
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

export interface CreateUserResponse {
    message: string;
    newUser: User;
}

export interface UpdateUserResponse {
    message: string;
    updatedUser: User;
}

export interface DeleteUserResponse {
    message: string;
}

export interface CreateTeamResponse {
    message: string;
    newTeam: Team;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: (headers) => {
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
        getTasks: build.query<Task[], { projectId: number }>({
            query: ({ projectId }) => `tasks?projectId=${projectId}`,
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
        getTeam: build.query<Team, number>({
            query: (teamId) => `teams/${teamId}`,
            providesTags: (result, error, teamId) => [{ type: "Teams" as const, id: teamId }],
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
        createUser: build.mutation<CreateUserResponse, Partial<User> & { password: string }>({
            query: (user) => ({
                url: "users",
                method: "POST",
                body: user,
            }),
            invalidatesTags: ["Users"],
        }),
        createTeam: build.mutation<CreateTeamResponse, Partial<Team>>({
            query: (team) => ({
                url: "teams",
                method: "POST",
                body: team,
            }),
            invalidatesTags: ["Teams"],
        }),
        updateUser: build.mutation<UpdateUserResponse, Partial<User> & { userId: number }>({
            query: (user) => ({
                url: `users/${user.userId}`,
                method: "PATCH",
                body: {
                    username: user.username,
                    role: user.role,
                    teamId: user.teamId,
                    profilePictureUrl: user.profilePictureUrl,
                },
            }),
            invalidatesTags: ["Users"],
        }),
        deleteUser: build.mutation<DeleteUserResponse, number>({
            query: (userId) => ({
                url: `users/${userId}`,
                method: "DELETE",
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
    useGetTeamQuery,
    useGetTasksByUserQuery,
    useGetAuthUserQuery,
    useGetUsersQuery,
    useCreateUserMutation,
    useCreateTeamMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = api;