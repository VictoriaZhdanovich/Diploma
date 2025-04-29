import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Определяем интерфейс для тела запроса
interface CreateUserBody {
  username: string;
  password: string;
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

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Преобразуем отображённые значения в значения перечисления
    const roleMap: Record<string, "SupportStaff" | "Administrator"> = {
      "Сотрудник_поддержки": "SupportStaff",
      "Администратор": "Administrator",
      "SupportStaff": "SupportStaff",
      "Administrator": "Administrator",
    };

    const role = roleMap[roleFromBody] || "SupportStaff";

    // Находим максимальный userId и увеличиваем его на 1
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
    res.json({ message: "User Created Successfully", newUser });
  } catch (error: any) {
    res.status(500).json({ message: `Error creating user: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};