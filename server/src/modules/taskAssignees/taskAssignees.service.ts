import { AppError } from "../../common/errors/AppError.js";
import prisma from "../../lib/prisma.js";
import type { AssignTaskMemberInput } from "./taskAssignees.schema.js";

export async function assignTaskMember(projectId: string, taskId: string, currentUserId: string, input: AssignTaskMemberInput) {
    const currentMembership = await prisma.projectMember.findFirst({
        where: {
            userId: currentUserId,
            projectId,
        },
        select: {
            role: true,
        }
    });

    if (!currentMembership) {
        throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    if (currentMembership.role === "MEMBER") {
        throw new AppError({ message: "Forbidden", statusCode: 403, code: "FORBIDDEN" });
    }

    const currentTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            column: {
                projectId,
            }
        },
        select: {
            id: true,
        }
    });

    if (!currentTask) {
        throw new AppError({ message: "Task not found", statusCode: 404, code: "TASK_NOT_FOUND" });
    }

    const projectMember = await prisma.projectMember.findFirst({
        where: {
            id: input.projectMemberId,
            projectId,
        },
        select: {
            taskAssignments: {
                where: {
                    taskId,
                    projectMemberId: input.projectMemberId,
                }
            }
        }
    });

    if (!projectMember) {
        throw new AppError({ message: "Project member not found", statusCode: 404, code: "PROJECT_MEMBER_NOT_FOUND" });
    }

    if (projectMember.taskAssignments.length > 0) {
        throw new AppError({ message: "Task assignee already exists", statusCode: 409, code: "TASK_ASSIGNEE_ALREADY_EXISTS" });
    }

    const newAssignee = await prisma.taskAssignee.create({
        data: {
            taskId,
            projectMemberId: input.projectMemberId,
        }
    });

    return newAssignee;
}

export async function unassignTaskMember(projectId: string, taskId: string, currentUserId: string, projectMemberId: string) {
    const currentMembership = await prisma.projectMember.findFirst({
        where: {
            userId: currentUserId,
            projectId,
        },
        select: {
            role: true,
        }
    });

    if (!currentMembership) {
        throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    if (currentMembership.role === "MEMBER") {
        throw new AppError({ message: "Forbidden", statusCode: 403, code: "FORBIDDEN" });
    }

    const currentTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            column: {
                projectId,
            }
        },
        select: {
            id: true,
        }
    });

    if (!currentTask) {
        throw new AppError({ message: "Task not found", statusCode: 404, code: "TASK_NOT_FOUND" });
    }

    const projectMember = await prisma.projectMember.findFirst({
        where: {
            id: projectMemberId,
            projectId,
        },
        select: {
            taskAssignments: {
                where: {
                    taskId,
                    projectMemberId,
                }
            }
        }
    });

    if (!projectMember) {
        throw new AppError({ message: "Project member not found", statusCode: 404, code: "PROJECT_MEMBER_NOT_FOUND" });
    }

    if (projectMember.taskAssignments.length === 0) {
        throw new AppError({ message: "Task assignee not found", statusCode: 404, code: "TASK_ASSIGNEE_NOT_FOUND" });
    }

    await prisma.taskAssignee.delete({
        where: {
            taskId_projectMemberId: {
                taskId,
                projectMemberId,
            },
        },
    });
}