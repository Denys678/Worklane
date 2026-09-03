import type { RequestHandler } from "express";
import type { AssignTaskMemberInput, UnassignTaskMemberParams } from "./taskAssignees.schema.js";
import type { TaskIdParams } from "../tasks/task.schema.js";
import { assignTaskMember, unassignTaskMember } from "./taskAssignees.service.js";
import { broadcastToProject } from "../../websocket/websocket.rooms.js";

export const assignTaskMemberController: RequestHandler = async (req, res) => {
    const input = req.body as AssignTaskMemberInput;
    const { projectId, taskId } = req.params as TaskIdParams;
    const currentUserId = res.locals.userId;

    const newAssignee = await assignTaskMember(projectId, taskId, currentUserId, input);

    broadcastToProject(projectId, {
        type: "TASK_ASSIGNEE_ADDED",
        payload: {
            projectId,
            taskId,
            projectMemberId: newAssignee.projectMemberId,
            assignedAt: newAssignee.assignedAt.toISOString(),
        },
    });
    return res.status(201).json({
        data: newAssignee,
    });
}

export const unassignTaskMemberController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const { projectId, taskId, projectMemberId } = req.params as UnassignTaskMemberParams;

    await unassignTaskMember(projectId, taskId, currentUserId, projectMemberId);

    broadcastToProject(projectId, {
        type: "TASK_ASSIGNEE_DELETED",
        payload: {
            projectId,
            taskId,
            projectMemberId,
        }
    });

    return res.status(204).send();
}