import express from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateRequest } from "../../common/middleware/validateRequest.js";
import { projectIdParamsSchema } from "../projects/project.schema.js";
import { createTaskSchema, moveTaskSchema, taskIdParamsSchema, updateTaskSchema } from "./task.schema.js";
import { createTaskController, deleteProjectTaskController, getProjectTaskController, getProjectTasksController, moveTaskController, updateTaskController } from "./task.controller.js";

const router = express.Router();

router.post("/:projectId/tasks", authenticate, validateRequest(projectIdParamsSchema, "params"), validateRequest(createTaskSchema, "body"), createTaskController);
router.get("/:projectId/tasks", authenticate, validateRequest(projectIdParamsSchema, "params"), getProjectTasksController);
router.get("/:projectId/tasks/:taskId", authenticate, validateRequest(taskIdParamsSchema, "params"), getProjectTaskController);
router.patch("/:projectId/tasks/:taskId", authenticate, validateRequest(taskIdParamsSchema, "params"), validateRequest(updateTaskSchema, "body"), updateTaskController);
router.delete("/:projectId/tasks/:taskId", authenticate, validateRequest(taskIdParamsSchema, "params"), deleteProjectTaskController);
router.patch("/:projectId/tasks/:taskId/move", authenticate, validateRequest(taskIdParamsSchema, "params"), validateRequest(moveTaskSchema, "body"), moveTaskController);

export default router;