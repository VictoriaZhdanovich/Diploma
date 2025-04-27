"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTasks = exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving tasks: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, status, priority = "Низкий", tags, startDate, dueDate, points, projectId, authorUserId, assignedUserId, } = req.body;
    console.log("Received payload:", req.body);
    console.log("authorUserId:", authorUserId, "assignedUserId:", assignedUserId);
    // Валидация: проверяем, что authorUserId и assignedUserId указаны
    if (!authorUserId || !assignedUserId) {
        res.status(400).json({ message: "Инициатор и исполнитель обязательны." });
        return;
    }
    // Проверяем, что пользователи существуют
    const authorExists = yield prisma.users.findUnique({
        where: { userId: authorUserId },
    });
    const assigneeExists = yield prisma.users.findUnique({
        where: { userId: assignedUserId },
    });
    if (!authorExists) {
        res.status(400).json({ message: `Пользователь с ID ${authorUserId} (инициатор) не найден.` });
        return;
    }
    if (!assigneeExists) {
        res.status(400).json({ message: `Пользователь с ID ${assignedUserId} (исполнитель) не найден.` });
        return;
    }
    // Устанавливаем значения по умолчанию для дат
    const defaultStartDate = startDate ? new Date(startDate) : new Date();
    const defaultDueDate = dueDate ? new Date(dueDate) : (() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
    })();
    try {
        const newTask = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                startDate: defaultStartDate,
                dueDate: defaultDueDate,
                points,
                projectId,
                authorUserId,
                assignedUserId,
            },
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating a task: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.createTask = createTask;
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = yield prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data: {
                status: status,
            },
        });
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating task: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.updateTaskStatus = updateTaskStatus;
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                OR: [
                    { authorUserId: Number(userId) },
                    { assignedUserId: Number(userId) },
                ],
            },
            include: {
                author: true,
                assignee: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user's tasks: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getUserTasks = getUserTasks;
