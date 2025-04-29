"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/teamRoutes.ts
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const router = (0, express_1.Router)();
router.get("/", teamController_1.getTeams);
router.get("/:id", teamController_1.getTeamById); // Новый маршрут для получения команды по ID
exports.default = router;
