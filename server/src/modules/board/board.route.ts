import express from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateRequest } from "../../common/middleware/validateRequest.js";
import { projectIdParamsSchema } from "../projects/project.schema.js";
import { getProjectBoardController } from "./board.controller.js";

const router = express.Router();

router.get("/:projectId/board", authenticate, validateRequest(projectIdParamsSchema, "params"), getProjectBoardController);

export default router;