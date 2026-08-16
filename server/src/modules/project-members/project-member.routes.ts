import express from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateRequest } from "../../common/middleware/validateRequest.js";
import { addProjectMemberSchema, projectMemberParamsSchema, updateProjectMemberRoleSchema } from "./project-member.schema.js";
import { addProjectMemberController, deleteProjectMemberController, getProjectMembersController, updateProjectMemberRoleController } from "./project-member.controller.js";
import { projectIdParamsSchema } from "../projects/project.schema.js";

const router = express.Router();

router.post("/:projectId/members", authenticate, validateRequest(projectIdParamsSchema, "params"), validateRequest(addProjectMemberSchema, "body"), addProjectMemberController);
router.get("/:projectId/members", authenticate, validateRequest(projectIdParamsSchema, "params"), getProjectMembersController);
router.patch("/:projectId/members/:memberId", authenticate, validateRequest(projectMemberParamsSchema, "params"), validateRequest(updateProjectMemberRoleSchema, "body"), updateProjectMemberRoleController);
router.delete("/:projectId/members/:memberId", authenticate, validateRequest(projectMemberParamsSchema, "params"), deleteProjectMemberController);

export default router;