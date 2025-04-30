import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Тип для команды с включёнными отношениями
type TeamWithRelations = Prisma.teamGetPayload<{
  include: {
    productOwner: true;
    projectManager: true;
    users: true;
  };
}>;

// Тип для пользователя
type User = Prisma.usersGetPayload<{}>;

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        productOwner: true,
        projectManager: true,
        users: true,
      },
    });

    const formattedTeams = teams.map((team: TeamWithRelations) => ({
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
      teamMembers: team.users.map((member: User) => ({
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
            profilePictureUrl: team.projectManager.profilePictureUrl,
          }
        : null,
      teamMembers: team.users.map((member: User) => ({
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

interface CreateTeamBody {
  teamName: string;
  productOwnerId: number;
  projectManagerId: number;
}

export const postTeam = async (
  req: Request<{}, {}, CreateTeamBody>,
  res: Response
): Promise<void> => {
  try {
    const { teamName, productOwnerId, projectManagerId } = req.body;

    // Проверяем, существует ли Product Owner
    const productOwner = await prisma.users.findUnique({
      where: { userId: productOwnerId },
    });
    if (!productOwner) {
      res.status(400).json({ message: `Пользователь с ID ${productOwnerId} не найден` });
      return;
    }

    // Проверяем, существует ли Project Manager
    const projectManager = await prisma.users.findUnique({
      where: { userId: projectManagerId },
    });
    if (!projectManager) {
      res.status(400).json({ message: `Пользователь с ID ${projectManagerId} не найден` });
      return;
    }

    // Проверяем, не существует ли команда с таким названием
    const existingTeam = await prisma.team.findFirst({
      where: { teamName },
    });
    if (existingTeam) {
      res.status(400).json({ message: "Команда с таким названием уже существует" });
      return;
    }

    // Создаём новую команду
    const newTeam = await prisma.team.create({
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
      teamMembers: newTeam.users.map((member: User) => ({
        username: member.username,
        profilePictureUrl: member.profilePictureUrl,
      })),
    };

    res.status(201).json({ message: "Team Created Successfully", newTeam: formattedTeam });
  } catch (error: any) {
    res.status(500).json({ message: `Error creating team: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};