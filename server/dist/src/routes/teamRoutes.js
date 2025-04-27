"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/teamRoutes.ts
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const router = (0, express_1.Router)();
router.get("/", teamController_1.getTeams);
exports.default = router;
