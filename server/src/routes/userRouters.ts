import { Router } from "express";
import { getUser, getUsers, postUser } from "../controllers/userController";
import { authenticateToken } from "../controllers/authController"; // Добавляем middleware

const router = Router();

router.get("/", authenticateToken, getUsers); // Добавляем защиту
router.post("/", authenticateToken, postUser); // Добавляем защиту
router.get("/:userId", authenticateToken, getUser); // Меняем cognitoId на userId

export default router;