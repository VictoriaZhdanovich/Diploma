// server/src/controllers/teamController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
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
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving teams: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = parseInt(req.params.id);
    const team = await prisma.team.findUnique({
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
            profilePictureUrl: team.projectManager.profilePictureUrl, // Исправлено: projectManager вместо productManager
          }
        : null,
      teamMembers: team.users.map((member) => ({
        username: member.username,
        profilePictureUrl: member.profilePictureUrl,
      })),
    };

    res.json(formattedTeam);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving team: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};