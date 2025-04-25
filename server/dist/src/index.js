"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
// import searchRoutes from "./routes/searchRoutes";
// import userRoutes from "./routes/userRouters";
// import teamRoutes from "./routes/teamRoutes";
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("This is home route");
});
app.use("/project", projectRoutes_1.default); // Измените /projects на /project
app.use("/tasks", taskRoutes_1.default);
// app.use("/search", searchRoutes);
// app.use("/users", userRoutes);
// app.use("/teams", teamRoutes);
// Обработка 404
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
const port = process.env.PORT || 3000;
try {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
catch (error) {
    console.error("Failed to start server:", error);
}
