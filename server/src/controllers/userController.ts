// server/src/controllers/userController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Определяем интерфейс для тела запроса
interface CreateUserBody {
  username: string;
  cognitoId: string;
  profilePictureUrl?: string;
  teamId?: number;
  role: "SupportStaff" | "Administrator"; // Соответствует enum Role
}

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const user = await prisma.users.findFirst({
      where: {
        cognitoId: cognitoId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const postUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  try {
    const {
      username,
      cognitoId,
      profilePictureUrl = "user.jpg",
      teamId = 1,
      role: roleFromBody = "SupportStaff",
    } = req.body;

    // Преобразуем отображённые значения в значения перечисления
    const roleMap: Record<string, "SupportStaff" | "Administrator"> = {
      "Сотрудник_поддержки": "SupportStaff",
      "Администратор": "Administrator",
      "SupportStaff": "SupportStaff",
      "Administrator": "Administrator",
    };

    const role = roleMap[roleFromBody] || "SupportStaff"; // Дефолтное значение

    // Находим максимальный userId и увеличиваем его на 1
    const lastUser = await prisma.users.findFirst({
      orderBy: { userId: "desc" },
    });
    const newUserId = lastUser ? lastUser.userId + 1 : 1; // Если пользователей нет, начинаем с 1

    const newUser = await prisma.users.create({
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
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};