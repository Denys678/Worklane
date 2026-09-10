import { AppError } from "../../common/errors/AppError.js";
import prisma from "../../lib/prisma.js";

export async function getProjectBoard(currentUserId: string, projectId: string) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            members: {
                some: {
                    userId: currentUserId,
                }
            }
        },
        select: {
            id: true,
            name: true,
            members: {
                select: {
                    id: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            columns: {
                select: {
                    id: true,
                    name: true,
                    position: true,
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            priority: true,
                            dueDate: true,
                            position: true,
                            columnId: true,
                            createdAt: true,
                            updatedAt: true,
                            assignees: {
                                select: {
                                    projectMemberId: true,
                                    assignedAt: true,
                                    projectMember: {
                                        select: {
                                            id: true,
                                            role: true,
                                            user: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    email: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: {
                            position: "asc",
                        },
                    },
                },
                orderBy: {
                    position: "asc",
                },
            },
        },
    });

    if (!project) {
        throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    return project;
}