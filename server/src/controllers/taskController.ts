import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority = "Низкий",
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  console.log("Received payload:", req.body);
  console.log("authorUserId:", authorUserId, "assignedUserId:", assignedUserId);

  // Валидация: проверяем, что authorUserId и assignedUserId указаны
  if (!authorUserId || !assignedUserId) {
    res.status(400).json({ message: "Инициатор и исполнитель обязательны." });
    return;
  }

  // Проверяем, что пользователи существуют
  const authorExists = await prisma.users.findUnique({
    where: { userId: authorUserId },
  });
  const assigneeExists = await prisma.users.findUnique({
    where: { userId: assignedUserId },
  });

  if (!authorExists) {
    res.status(400).json({ message: `Пользователь с ID ${authorUserId} (инициатор) не найден.` });
    return;
  }
  if (!assigneeExists) {
    res.status(400).json({ message: `Пользователь с ID ${assignedUserId} (исполнитель) не найден.` });
    return;
  }

  // Устанавливаем значения по умолчанию для дат
  const defaultStartDate = startDate ? new Date(startDate) : new Date();
  const defaultDueDate = dueDate ? new Date(dueDate) : (() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  })();

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: defaultStartDate,
        dueDate: defaultDueDate,
        points,
        projectId,
        authorUserId,
        assignedUserId,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};