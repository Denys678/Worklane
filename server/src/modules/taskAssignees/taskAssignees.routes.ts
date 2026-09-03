import express from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateRequest } from "../../common/middleware/validateRequest.js";
import { taskIdParamsSchema } from "../tasks/task.schema.js";
import { assignTaskMemberSchema, unassignTaskMemberParamsSchema } from "./taskAssignees.schema.js";
import { assignTaskMemberController, unassignTaskMemberController } from "./taskAssignees.controller.js";

const router = express.Router();


router.post("/:projectId/tasks/:taskId/assignees", authenticate, validateRequest(taskIdParamsSchema, "params"), validateRequest(assignTaskMemberSchema, "body"), assignTaskMemberController);
router.delete("/:projectId/tasks/:taskId/assignees/:projectMemberId", authenticate, validateRequest(unassignTaskMemberParamsSchema, "params"), unassignTaskMemberController);

export default router;