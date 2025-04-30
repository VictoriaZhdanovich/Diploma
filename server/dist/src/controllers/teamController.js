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
exports.postTeam = exports.getTeamById = exports.getTeams = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield prisma.team.findMany({
            include: {
                productOwner: true,
                projectManager: true,
                users: true,
            },
        });
        const formattedTeams = teams.map((team) => ({
            id: team.id,
            teamName: team.teamName,
            productOwner: team.productOwner
                ? {
                    username: team.productOwner.username,
                    profilePictureUrl: team.productOwner.profilePictureUrl,
                }
                : null,
            projectManager: team.projectManager
                ? {
                    username: team.projectManager.username,
                    profilePictureUrl: team.projectManager.profilePictureUrl,
                }
                : null,
            teamMembers: team.users.map((member) => ({
                username: member.username,
                profilePictureUrl: member.profilePictureUrl,
            })),
        }));
        res.json(formattedTeams);
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving teams: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getTeams = getTeams;
const getTeamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = parseInt(req.params.id);
        const team = yield prisma.team.findUnique({
            where: { id: teamId },
            include: {
                productOwner: true,
                projectManager: true,
                users: true,
            },
        });
        if (!team) {
            res.status(404).json({ message: "Команда не найдена" });
            return;
        }
        const formattedTeam = {
            id: team.id,
            teamName: team.teamName,
            productOwner: team.productOwner
                ? {
                    username: team.productOwner.username,
                    profilePictureUrl: team.productOwner.profilePictureUrl,
                }
                : null,
            projectManager: team.projectManager
                ? {
                    username: team.projectManager.username,
                    profilePictureUrl: team.projectManager.profilePictureUrl,
                }
                : null,
            teamMembers: team.users.map((member) => ({
                username: member.username,
                profilePictureUrl: member.profilePictureUrl,
            })),
        };
        res.json(formattedTeam);
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving team: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getTeamById = getTeamById;
const postTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamName, productOwnerId, projectManagerId } = req.body;
        // Проверяем, существует ли Product Owner
        const productOwner = yield prisma.users.findUnique({
            where: { userId: productOwnerId },
        });
        if (!productOwner) {
            res.status(400).json({ message: `Пользователь с ID ${productOwnerId} не найден` });
            return;
        }
        // Проверяем, существует ли Project Manager
        const projectManager = yield prisma.users.findUnique({
            where: { userId: projectManagerId },
        });
        if (!projectManager) {
            res.status(400).json({ message: `Пользователь с ID ${projectManagerId} не найден` });
            return;
        }
        // Проверяем, не существует ли команда с таким названием
        const existingTeam = yield prisma.team.findFirst({
            where: { teamName },
        });
        if (existingTeam) {
            res.status(400).json({ message: "Команда с таким названием уже существует" });
            return;
        }
        // Создаём новую команду
        const newTeam = yield prisma.team.create({
            data: {
                teamName,
                productOwnerUserId: productOwnerId, // Исправили productOwnerId на productOwnerUserId
                projectManagerUserId: projectManagerId, // Исправили projectManagerId на projectManagerUserId
            },
            include: {
                productOwner: true,
                projectManager: true,
                users: true,
            },
        });
        const formattedTeam = {
            id: newTeam.id,
            teamName: newTeam.teamName,
            productOwner: newTeam.productOwner
                ? {
                    username: newTeam.productOwner.username,
                    profilePictureUrl: newTeam.productOwner.profilePictureUrl,
                }
                : null,
            projectManager: newTeam.projectManager
                ? {
                    username: newTeam.projectManager.username,
                    profilePictureUrl: newTeam.projectManager.profilePictureUrl,
                }
                : null,
            teamMembers: newTeam.users.map((member) => ({
                username: member.username,
                profilePictureUrl: member.profilePictureUrl,
            })),
        };
        res.status(201).json({ message: "Team Created Successfully", newTeam: formattedTeam });
    }
    catch (error) {
        res.status(500).json({ message: `Error creating team: ${error.message}` });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.postTeam = postTeam;
