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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.postUser = exports.getUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.users.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving users: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield prisma.users.findFirst({
            where: {
                userId: Number(userId),
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving user: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getUser = getUser;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, profilePictureUrl = "user.jpg", teamId = 1, role: roleFromBody = "SupportStaff", } = req.body;
        const existingUser = yield prisma.users.findFirst({
            where: { username },
        });
        if (existingUser) {
            res.status(400).json({ message: "Пользователь с таким именем уже существует" });
            return;
        }
        if (teamId) {
            const team = yield prisma.team.findUnique({
                where: { id: teamId },
            });
            if (!team) {
                res.status(400).json({ message: `Команда с ID ${teamId} не найдена` });
                return;
            }
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const roleMap = {
            "Сотрудник_поддержки": "SupportStaff",
            "Администратор": "Administrator",
            "SupportStaff": "SupportStaff",
            "Administrator": "Administrator",
        };
        const role = roleMap[roleFromBody] || "SupportStaff";
        const lastUser = yield prisma.users.findFirst({
            orderBy: { userId: "desc" },
        });
        const newUserId = lastUser ? lastUser.userId + 1 : 1;
        const newUser = yield prisma.users.create({
            data: {
                userId: newUserId,
                username,
                password: hashedPassword,
                profilePictureUrl,
                teamId,
                role,
                forcePasswordChange: false,
            },
        });
        res.status(201).json({ message: "User Created Successfully", newUser });
    }
    catch (error) {
        res.status(500).json({ message: `Error creating user: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.postUser = postUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { username, profilePictureUrl, teamId, role: roleFromBody } = req.body;
        const existingUser = yield prisma.users.findFirst({
            where: { userId: Number(userId) },
        });
        if (!existingUser) {
            res.status(404).json({ message: "Пользователь не найден" });
            return;
        }
        const duplicateUser = yield prisma.users.findFirst({
            where: { username, userId: { not: Number(userId) } },
        });
        if (duplicateUser) {
            res.status(400).json({ message: "Пользователь с таким именем уже существует" });
            return;
        }
        if (teamId) {
            const team = yield prisma.team.findUnique({
                where: { id: teamId },
            });
            if (!team) {
                res.status(400).json({ message: `Команда с ID ${teamId} не найдена` });
                return;
            }
        }
        const roleMap = {
            "Сотрудник_поддержки": "SupportStaff",
            "Администратор": "Administrator",
            "SupportStaff": "SupportStaff",
            "Administrator": "Administrator",
        };
        const role = roleMap[roleFromBody] || "SupportStaff";
        const updatedUser = yield prisma.users.update({
            where: { userId: Number(userId) },
            data: {
                username,
                profilePictureUrl,
                teamId: teamId !== null && teamId !== void 0 ? teamId : null,
                role,
            },
        });
        res.status(200).json({ message: "User Updated Successfully", updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: `Error updating user: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const existingUser = yield prisma.users.findFirst({
            where: { userId: Number(userId) },
        });
        if (!existingUser) {
            res.status(404).json({ message: "Пользователь не найден" });
            return;
        }
        yield prisma.users.delete({
            where: { userId: Number(userId) },
        });
        res.status(200).json({ message: "User Deleted Successfully" });
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting user: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.deleteUser = deleteUser;
