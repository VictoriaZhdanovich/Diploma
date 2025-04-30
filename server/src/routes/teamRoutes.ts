import { Router } from "express";
import { getTeams, getTeamById, postTeam } from "../controllers/teamController";
import { authenticateToken } from "../controllers/authController";

const router = Router();

router.get("/", authenticateToken, getTeams);
router.get("/:id", authenticateToken, getTeamById);
router.post("/", authenticateToken, postTeam);

export default router;