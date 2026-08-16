import express from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateRequest } from "../../common/middleware/validateRequest.js";
import { projectIdParamsSchema } from "../projects/project.schema.js";
import { boardColumnParamsSchema, createBoardColumnSchema, moveBoardColumnSchema, renameBoardColumnSchema } from "./board-column.schema.js";
import { createBoardColumnController, deleteBoardColumnController, getProjectColumnsController, moveBoardColumnController, renameBoardColumnController } from "./board-column.controller.js";

const router = express.Router();

router.post("/:projectId/columns", authenticate, validateRequest(projectIdParamsSchema, "params"), validateRequest(createBoardColumnSchema, "body"), createBoardColumnController);
router.get("/:projectId/columns", authenticate, validateRequest(projectIdParamsSchema, "params"), getProjectColumnsController);
router.patch("/:projectId/columns/:columnId", authenticate, validateRequest(boardColumnParamsSchema, "params"), validateRequest(renameBoardColumnSchema, "body"), renameBoardColumnController);
router.patch("/:projectId/columns/:columnId/move", authenticate, validateRequest(boardColumnParamsSchema, "params"), validateRequest(moveBoardColumnSchema, "body"), moveBoardColumnController);
router.delete("/:projectId/columns/:columnId", authenticate, validateRequest(boardColumnParamsSchema, "params"), deleteBoardColumnController);

export default router;