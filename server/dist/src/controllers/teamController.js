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
exports.getTeams = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield prisma.team.findMany({
            include: {
                productOwner: true, // Включаем данные о владельце продукта
                projectManager: true, // Включаем данные о менеджере проекта
                users: true, // Включаем данные о членах команды
            },
        });
        // Форматируем данные для фронтенда
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
