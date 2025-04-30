import { Router } from "express";
import { getUser, getUsers, postUser, updateUser, deleteUser } from "../controllers/userController";
import { authenticateToken } from "../controllers/authController";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.post("/", authenticateToken, postUser);
router.get("/:userId", authenticateToken, getUser);
router.patch("/:userId", authenticateToken, updateUser);
router.delete("/:userId", authenticateToken, deleteUser);

export default router;