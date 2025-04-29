import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Тип для объекта пользователя, который будет в токене
interface JwtPayload {
  userId: number;
  username: string;
}

// Расширяем тип Request, чтобы добавить поле user
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware для проверки токена
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Токен отсутствует" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Неверный токен" });
      return;
    }
    req.user = user as JwtPayload;
    next();
  });
};

// Эндпоинт для входа
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  console.log(`Попытка входа: username=${username}, password=${password}`);

  try {
    console.log("Поиск пользователя в базе данных...");
    const user = await prisma.users.findFirst({
      where: { username },
    });

    if (!user) {
      console.log(`Пользователь не найден: ${username}`);
      res.status(401).json({ error: "Пользователь не найден" });
      return;
    }

    console.log(`Пользователь найден: ${JSON.stringify(user)}`);

    console.log("Проверка пароля...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Результат проверки пароля: ${isMatch}`);

    if (!isMatch) {
      console.log(`Пароль не совпадает для пользователя: ${username}`);
      res.status(401).json({ error: "Неверный пароль" });
      return;
    }

    console.log("Генерация токена...");
    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("Отправка ответа...");
    res.json({
      token,
      userDetails: {
        userId: user.userId,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        teamId: user.teamId,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error: any) {
    console.error(`Ошибка при входе: ${error.message}, stack: ${error.stack}`);
    res.status(500).json({ message: `Ошибка при входе: ${error.message}` });
  } finally {
    console.log("Отключение от базы данных...");
    await prisma.$disconnect();
  }
};

// Эндпоинт для получения данных пользователя
export const getAuthUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const user = req.user;

  if (!user) {
    console.log("Пользователь не авторизован");
    res.status(401).json({ error: "Не авторизован" });
    return;
  }

  try {
    console.log(`Поиск пользователя в базе данных: ${user.username}`);
    const dbUser = await prisma.users.findFirst({
      where: { username: user.username },
    });

    if (!dbUser) {
      console.log(`Пользователь не найден: ${user.username}`);
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    console.log(`Пользователь найден: ${JSON.stringify(dbUser)}`);
    res.json({
      userDetails: {
        userId: dbUser.userId,
        username: dbUser.username,
        profilePictureUrl: dbUser.profilePictureUrl,
        teamId: dbUser.teamId,
        role: dbUser.role,
        forcePasswordChange: dbUser.forcePasswordChange,
      },
    });
  } catch (error: any) {
    console.error(
      `Ошибка при получении пользователя: ${error.message}, stack: ${error.stack}`
    );
    res.status(500).json({
      message: `Ошибка при получении пользователя: ${error.message}`,
    });
  } finally {
    console.log("Отключение от базы данных...");
    await prisma.$disconnect();
  }
};

// Эндпоинт для смены пароля
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { password } = req.body;
  const user = req.user;

  if (!user) {
    console.log("Пользователь не авторизован");
    res.status(401).json({ error: "Не авторизован" });
    return;
  }

  try {
    console.log(`Хеширование нового пароля для пользователя: ${user.username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Обновление пароля в базе данных...");
    await prisma.users.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        forcePasswordChange: false,
      },
    });
    console.log("Пароль успешно изменён");
    res.status(200).json({ message: "Пароль успешно изменён" });
  } catch (error: any) {
    console.error(
      `Ошибка при смене пароля: ${error.message}, stack: ${error.stack}`
    );
    res.status(500).json({ message: `Ошибка при смене пароля: ${error.message}` });
  } finally {
    console.log("Отключение от базы данных...");
    await prisma.$disconnect();
  }
};