"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController"); // Добавляем middleware
const router = (0, express_1.Router)();
router.get("/", authController_1.authenticateToken, userController_1.getUsers); // Добавляем защиту
router.post("/", authController_1.authenticateToken, userController_1.postUser); // Добавляем защиту
router.get("/:userId", authController_1.authenticateToken, userController_1.getUser); // Меняем cognitoId на userId
exports.default = router;
