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
exports.postUser = exports.getUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.users.findMany();
        res.json(users);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving users: ${error.message}` });
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cognitoId } = req.params;
    try {
        const user = yield prisma.users.findFirst({
            where: {
                cognitoId: cognitoId,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user: ${error.message}` });
    }
});
exports.getUser = getUser;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, cognitoId, profilePictureUrl = "user.jpg", teamId = 1, role: roleFromBody = "SupportStaff", } = req.body;
        // Преобразуем отображённые значения в значения перечисления
        const roleMap = {
            "Сотрудник_поддержки": "SupportStaff",
            "Администратор": "Administrator",
            "SupportStaff": "SupportStaff",
            "Administrator": "Administrator",
        };
        const role = roleMap[roleFromBody] || "SupportStaff"; // Дефолтное значение
        // Находим максимальный userId и увеличиваем его на 1
        const lastUser = yield prisma.users.findFirst({
            orderBy: { userId: "desc" },
        });
        const newUserId = lastUser ? lastUser.userId + 1 : 1; // Если пользователей нет, начинаем с 1
        const newUser = yield prisma.users.create({
            data: {
                userId: newUserId, // Передаём сгенерированный userId
                username,
                cognitoId,
                profilePictureUrl,
                teamId,
                role,
            },
        });
        res.json({ message: "User Created Successfully", newUser });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving users: ${error.message}` });
    }
});
exports.postUser = postUser;
