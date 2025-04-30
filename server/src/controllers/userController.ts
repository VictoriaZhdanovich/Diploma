import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

interface CreateUserBody {
  username: string;
  password: string;
  profilePictureUrl?: string;
  teamId?: number;
  role: "SupportStaff" | "Administrator";
}

interface UpdateUserBody {
  username: string;
  profilePictureUrl?: string;
  teamId?: number;
  role: "SupportStaff" | "Administrator";
}

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving users: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const user = await prisma.users.findFirst({
      where: {
        userId: Number(userId),
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving user: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const postUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      password,
      profilePictureUrl = "user.jpg",
      teamId = 1,
      role: roleFromBody = "SupportStaff",
    } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: { username },
    });

    if (existingUser) {
      res.status(400).json({ message: "Пользователь с таким именем уже существует" });
      return;
    }

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!team) {
        res.status(400).json({ message: `Команда с ID ${teamId} не найдена` });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleMap: Record<string, "SupportStaff" | "Administrator"> = {
      "Сотрудник_поддержки": "SupportStaff",
      "Администратор": "Administrator",
      "SupportStaff": "SupportStaff",
      "Administrator": "Administrator",
    };

    const role = roleMap[roleFromBody] || "SupportStaff";

    const lastUser = await prisma.users.findFirst({
      orderBy: { userId: "desc" },
    });
    const newUserId = lastUser ? lastUser.userId + 1 : 1;

    const newUser = await prisma.users.create({
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
  } catch (error: any) {
    res.status(500).json({ message: `Error creating user: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateUser = async (
  req: Request<{ userId: string }, {}, UpdateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username, profilePictureUrl, teamId, role: roleFromBody } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: { userId: Number(userId) },
    });

    if (!existingUser) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const duplicateUser = await prisma.users.findFirst({
      where: { username, userId: { not: Number(userId) } },
    });

    if (duplicateUser) {
      res.status(400).json({ message: "Пользователь с таким именем уже существует" });
      return;
    }

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!team) {
        res.status(400).json({ message: `Команда с ID ${teamId} не найдена` });
        return;
      }
    }

    const roleMap: Record<string, "SupportStaff" | "Administrator"> = {
      "Сотрудник_поддержки": "SupportStaff",
      "Администратор": "Administrator",
      "SupportStaff": "SupportStaff",
      "Administrator": "Administrator",
    };

    const role = roleMap[roleFromBody] || "SupportStaff";

    const updatedUser = await prisma.users.update({
      where: { userId: Number(userId) },
      data: {
        username,
        profilePictureUrl,
        teamId: teamId ?? null,
        role,
      },
    });

    res.status(200).json({ message: "User Updated Successfully", updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: `Error updating user: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteUser = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const existingUser = await prisma.users.findFirst({
      where: { userId: Number(userId) },
    });

    if (!existingUser) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    await prisma.users.delete({
      where: { userId: Number(userId) },
    });

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting user: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};