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
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => {
            const baseName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            return baseName === "taskAssignment" ? "taskAssignment" : baseName.replace("Team", "_team");
        });
        for (const modelName of modelNames) {
            console.log(`Attempting to access model: ${modelName}`);
            let model = prisma[modelName];
            if (!model && modelName === "taskAssignment") {
                model = prisma["task_assignment"];
                console.log(`Trying fallback model name: task_assignment`);
            }
            if (model && typeof model.deleteMany === "function") {
                try {
                    yield model.deleteMany({});
                    console.log(`Cleared data from ${modelName}`);
                }
                catch (error) {
                    console.error(`Error clearing data from ${modelName}:`, error.message);
                }
            }
            else {
                console.warn(`Model ${modelName} not found in Prisma client or deleteMany is not available. Available models:`, Object.keys(prisma));
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        const orderedFileNames = [
            "users.json",
            "project.json",
            "team.json",
            "projectTeam.json",
            "task.json",
            "attachment.json",
            "comment.json",
            "taskAssignment.json",
        ];
        yield deleteAllData(orderedFileNames);
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            try {
                const jsonData = JSON.parse(yield promises_1.default.readFile(filePath, "utf-8"));
                const baseName = path_1.default.basename(fileName, path_1.default.extname(fileName));
                const modelName = baseName === "taskAssignment" ? "taskAssignment" : baseName.replace("Team", "_team");
                console.log(`Attempting to seed into model: ${modelName}`);
                let model = prisma[modelName];
                if (!model && modelName === "taskAssignment") {
                    model = prisma["task_assignment"];
                    console.log(`Trying fallback model name: task_assignment`);
                }
                if (!model || typeof model.create !== "function") {
                    console.error(`Model ${modelName} not found in Prisma client or create is not available. Available models:`, Object.keys(prisma));
                    continue;
                }
                const dataArray = Array.isArray(jsonData) ? jsonData : jsonData[modelName];
                if (!Array.isArray(dataArray)) {
                    console.error(`Data in ${fileName} is not an array:`, jsonData);
                    continue;
                }
                for (const data of dataArray) {
                    try {
                        if (modelName === "users") {
                            // Удаляем cognitoId и добавляем захешированный пароль
                            delete data.cognitoId;
                            data.password = yield bcrypt_1.default.hash("TempPassword123!", 10);
                            data.forcePasswordChange = true;
                        }
                        yield model.create({ data });
                        console.log(`Seeded record in ${modelName}:`, data);
                    }
                    catch (error) {
                        console.error(`Error seeding record in ${modelName}:`, data, error.message);
                    }
                }
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            catch (error) {
                console.error(`Error processing file ${fileName}:`, error.message);
            }
        }
    });
}
main()
    .catch((e) => console.error("Error in main:", e.message))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    console.log("Disconnected from database");
}));
