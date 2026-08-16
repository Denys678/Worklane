import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import projectRouter from "./modules/projects/project.routes.js";
import memberRouter from "./modules/project-members/project-member.routes.js";
import columnRouter from "./modules/board-column/board-column.routes.js";
import { errorHandler } from "./common/middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
    return res.status(200).json({
        status: "ok",
    });
});

app.use("/api/auth", authRouter);

app.use("/api/projects", projectRouter);

app.use("/api/projects", memberRouter);

app.use("/api/projects", columnRouter);

app.use(errorHandler);

export default app;