import type { RequestHandler } from "express";
import { addProjectMember, deleteProjectMember, getProjectMembers, updateProjectMemberRole } from "./project-member.service.js";
import type { ProjectIdParams } from "../projects/project.schema.js";
import { ProjectMemberParams } from "./project-member.schema.js";
import { broadcastToProject } from "../../websocket/websocket.rooms.js";

export const addProjectMemberController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const newMember = await addProjectMember(input, projectId, currentUserId);

    broadcastToProject(projectId, {
        type: "PROJECT_MEMBER_ADDED",
        payload: {
            projectId,
            member: {
                id: newMember.id,
                role: newMember.role,
                joinedAt: newMember.joinedAt.toISOString(),
                user: newMember.user,
            },
        },
    });

    return res.status(201).json({
        data: newMember,
    });
}

export const getProjectMembersController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;
    
    const projectMembers = await getProjectMembers(projectId, currentUserId);

    return res.status(200).json({
        data: projectMembers,
    });
}

export const updateProjectMemberRoleController: RequestHandler = async (req, res) => {
    const { projectId, memberId } = req.params as ProjectMemberParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const updatedMember = await updateProjectMemberRole(input, projectId, memberId, currentUserId);

    broadcastToProject(projectId, {
        type: "PROJECT_MEMBER_UPDATED",
        payload: {
            projectId,
            memberId,
            role: updatedMember.role, 
        }
    });

    return res.status(200).json({
        data: updatedMember,
    });
}

export const deleteProjectMemberController: RequestHandler = async (req, res) => {
    const { projectId, memberId } = req.params as ProjectMemberParams;
    const currentUserId = res.locals.userId;
    
    await deleteProjectMember(currentUserId, memberId, projectId);

    broadcastToProject(projectId, {
        type: "PROJECT_MEMBER_DELETED",
        payload: {
            projectId,
            memberId,
        }
    });

    return res.status(204).send();
}