import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import projectRouter from "./modules/projects/project.routes.js";
import memberRouter from "./modules/project-members/project-member.routes.js";
import columnRouter from "./modules/board-column/board-column.routes.js";
import taskRouter from "./modules/tasks/task.routes.js";
import taskAssigneeRouter from "./modules/taskAssignees/taskAssignees.routes.js";
import boardRouter from "./modules/board/board.route.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./common/middleware/errorhandler.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
    return res.status(200).json({
        status: "ok",
    });
});

app.use("/api/auth", authRouter);

app.use("/api/projects", projectRouter);

app.use("/api/projects", memberRouter);

app.use("/api/projects", columnRouter);

app.use("/api/projects", taskRouter);

app.use("/api/projects", taskAssigneeRouter);

app.use("/api/projects", boardRouter);

app.use(errorHandler);

export default app;