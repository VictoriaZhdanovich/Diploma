// server/src/routes/teamRoutes.ts
import { Router } from "express";
import { getTeams, getTeamById } from "../controllers/teamController";

const router = Router();

router.get("/", getTeams);
router.get("/:id", getTeamById); // Новый маршрут для получения команды по ID

export default router;