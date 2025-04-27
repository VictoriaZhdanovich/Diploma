// server/src/controllers/teamController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
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
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving teams: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};