import type { RequestHandler } from "express";
import { addProjectMember, deleteProjectMember, getProjectMembers, updateProjectMemberRole } from "./project-member.service.js";
import type { ProjectIdParams } from "../projects/project.schema.js";
import { ProjectMemberParams } from "./project-member.schema.js";

export const addProjectMemberController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const newMember = await addProjectMember(input, projectId, currentUserId);

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

    return res.status(200).json({
        data: updatedMember,
    });
}

export const deleteProjectMemberController: RequestHandler = async (req, res) => {
    const { projectId, memberId } = req.params as ProjectMemberParams;
    const currentUserId = res.locals.userId;
    
    await deleteProjectMember(currentUserId, memberId, projectId);

    return res.status(204).send();
}