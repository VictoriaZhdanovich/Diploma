"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/login", authController_1.login);
router.get("/user", authController_1.authenticateToken, authController_1.getAuthUser);
router.post("/change-password", authController_1.authenticateToken, authController_1.changePassword);
exports.default = router;
