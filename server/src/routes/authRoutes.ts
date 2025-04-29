import { Router } from "express";
import { login, getAuthUser, changePassword, authenticateToken } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.get("/user", authenticateToken, getAuthUser);
router.post("/change-password", authenticateToken, changePassword);

export default router;