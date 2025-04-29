"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getAuthUser = exports.login = exports.authenticateToken = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Токен отсутствует" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: "Неверный токен" });
            return;
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Эндпоинт для входа
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log(`Попытка входа: username=${username}, password=${password}`);
    try {
        console.log("Поиск пользователя в базе данных...");
        const user = yield prisma.users.findFirst({
            where: { username },
        });
        if (!user) {
            console.log(`Пользователь не найден: ${username}`);
            res.status(401).json({ error: "Пользователь не найден" });
            return;
        }
        console.log(`Пользователь найден: ${JSON.stringify(user)}`);
        console.log("Проверка пароля...");
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        console.log(`Результат проверки пароля: ${isMatch}`);
        if (!isMatch) {
            console.log(`Пароль не совпадает для пользователя: ${username}`);
            res.status(401).json({ error: "Неверный пароль" });
            return;
        }
        console.log("Генерация токена...");
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, username: user.username }, JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("Отправка ответа...");
        res.json({
            token,
            userDetails: {
                userId: user.userId,
                username: user.username,
                profilePictureUrl: user.profilePictureUrl,
                teamId: user.teamId,
                role: user.role,
                forcePasswordChange: user.forcePasswordChange,
            },
        });
    }
    catch (error) {
        console.error(`Ошибка при входе: ${error.message}, stack: ${error.stack}`);
        res.status(500).json({ message: `Ошибка при входе: ${error.message}` });
    }
    finally {
        console.log("Отключение от базы данных...");
        yield prisma.$disconnect();
    }
});
exports.login = login;
// Эндпоинт для получения данных пользователя
const getAuthUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        console.log("Пользователь не авторизован");
        res.status(401).json({ error: "Не авторизован" });
        return;
    }
    try {
        console.log(`Поиск пользователя в базе данных: ${user.username}`);
        const dbUser = yield prisma.users.findFirst({
            where: { username: user.username },
        });
        if (!dbUser) {
            console.log(`Пользователь не найден: ${user.username}`);
            res.status(404).json({ error: "Пользователь не найден" });
            return;
        }
        console.log(`Пользователь найден: ${JSON.stringify(dbUser)}`);
        res.json({
            userDetails: {
                userId: dbUser.userId,
                username: dbUser.username,
                profilePictureUrl: dbUser.profilePictureUrl,
                teamId: dbUser.teamId,
                role: dbUser.role,
                forcePasswordChange: dbUser.forcePasswordChange,
            },
        });
    }
    catch (error) {
        console.error(`Ошибка при получении пользователя: ${error.message}, stack: ${error.stack}`);
        res.status(500).json({
            message: `Ошибка при получении пользователя: ${error.message}`,
        });
    }
    finally {
        console.log("Отключение от базы данных...");
        yield prisma.$disconnect();
    }
});
exports.getAuthUser = getAuthUser;
// Эндпоинт для смены пароля
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const user = req.user;
    if (!user) {
        console.log("Пользователь не авторизован");
        res.status(401).json({ error: "Не авторизован" });
        return;
    }
    try {
        console.log(`Хеширование нового пароля для пользователя: ${user.username}`);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        console.log("Обновление пароля в базе данных...");
        yield prisma.users.update({
            where: { userId: user.userId },
            data: {
                password: hashedPassword,
                forcePasswordChange: false,
            },
        });
        console.log("Пароль успешно изменён");
        res.status(200).json({ message: "Пароль успешно изменён" });
    }
    catch (error) {
        console.error(`Ошибка при смене пароля: ${error.message}, stack: ${error.stack}`);
        res.status(500).json({ message: `Ошибка при смене пароля: ${error.message}` });
    }
    finally {
        console.log("Отключение от базы данных...");
        yield prisma.$disconnect();
    }
});
exports.changePassword = changePassword;
