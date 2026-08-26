import { AppError } from "../../common/errors/AppError.js";
import prisma from "../../lib/prisma.js";
import type { CreateTaskInput, UpdateTaskInput } from "./task.schema.js";

export async function createTask(input: CreateTaskInput, currentUserId: string, projectId: string) {
    const result = await prisma.$transaction(async (tx) => {
        const currentMembership = await tx.projectMember.findFirst({
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

        const column = await tx.boardColumn.findFirst({
            where: {
                projectId,
                id: input.columnId,
            },
            select: {
                id: true,
            }
        });

        if (!column) {
            throw new AppError({ message: "Column not found", statusCode: 404, code: "COLUMN_NOT_FOUND" });
        }

        const lastTask = await tx.task.findFirst({
            where: {
                columnId: input.columnId,
            },
            orderBy: {
                position: "desc",
            },
            select: {
                position: true,
            },
        });

        const position = lastTask ? lastTask.position + 1 : 0;

        const newTask = await tx.task.create({
            data: {
                title: input.title,
                columnId: input.columnId,
                position,

                ...(input.description !== undefined && {
                    description: input.description,
                }),

                ...(input.priority !== undefined && {
                    priority: input.priority,
                }),

                ...(input.dueDate !== undefined && {
                    dueDate: new Date(input.dueDate),
                }),
            },
        });

        return newTask;

    });

    return result;
}

export async function getProjectTasks(currentUserId: string, projectId: string) {
    const currentMembership = await prisma.projectMember.findFirst({
        where: {
            userId: currentUserId,
            projectId,
        },
        select: {
            id: true,
        }
    });

    if (!currentMembership) {
        throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    const tasks = await prisma.task.findMany({
        where: {
            column: {
                projectId,
            },
        },
        orderBy: [
            {
                column: {
                    position: "asc",
                },
            },
            {
                position: "asc",
            },
        ],
    }
    );

    return tasks;

}

export async function getProjectTask(projectId: string, taskId: string, currentUserId: string) {
    const currentMembership = await prisma.projectMember.findFirst({
        where: {
            userId: currentUserId,
            projectId,
        },
        select: {
            id: true,
        }
    });

    if (!currentMembership) {
        throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            column: {
                projectId,
            }
        }
    });

    if (!task) {
        throw new AppError({ message: "Task not found", statusCode: 404, code: "TASK_NOT_FOUND" });
    }

    return task;
}

export async function updateTask(projectId: string, currentUserId: string, taskId: string, input: UpdateTaskInput) {
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

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            column: {
                projectId,
            }
        }
    });

    if (!task) {
        throw new AppError({ message: "Task not found", statusCode: 404, code: "TASK_NOT_FOUND" });
    }

    const updatedTask = await prisma.task.update({
        where: {
            id: task.id,
        },
        data: {
            ...(input.title !== undefined && {
                title: input.title,
            }),

            ...(input.description !== undefined && {
                description: input.description,
            }),

            ...(input.priority !== undefined && {
                priority: input.priority,
            }),

            ...(input.dueDate !== undefined && {
                dueDate: input.dueDate === null
                    ? null
                    : new Date(input.dueDate),
            }),
        },
    });

    return updatedTask;
}

export async function deleteProjectTask(projectId: string, taskId: string, currentUserId: string) {
    return prisma.$transaction(async (tx) => {
        const currentMembership = await tx.projectMember.findFirst({
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

        const targetTask = await tx.task.findFirst({
            where: {
                id: taskId,
                column: {
                    projectId,
                }
            }
        });

        if (!targetTask) {
            throw new AppError({ message: "Task not found", statusCode: 404, code: "TASK_NOT_FOUND" });
        }

         await tx.task.delete({
            where: {
                id: targetTask.id,
            },
        });

        await tx.task.updateMany({
            where: {
                columnId: targetTask.columnId,
                position: {
                    gt: targetTask.position,
                },
            },
            data: {
                position: {
                    decrement: 1,
                },
            },
        });
    });
}