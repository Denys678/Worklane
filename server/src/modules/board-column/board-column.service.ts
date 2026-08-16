import { AppError } from "../../common/errors/AppError.js";
import prisma from "../../lib/prisma.js";
import type { CreateBoardColumnInput, MoveBoardColumnInput, RenameBoardColumnInput } from "./board-column.schema.js";

export async function createBoardColumn(projectId: string, input: CreateBoardColumnInput, currentUserId: string) {
    return prisma.$transaction(async (tx) => {
        const projectMember = await tx.projectMember.findFirst({
            where: {
                userId: currentUserId,
                projectId,
            }
        });

        if (!projectMember) {
            throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
        }

        if (projectMember.role === "MEMBER") {
            throw new AppError({ message: "You don't have permission to create a board column", statusCode: 403, code: "FORBIDDEN" });
        }

        const columnMaxPosition = await tx.boardColumn.aggregate({
            where: {
                projectId,
            },
            _max: {
                position: true,
            }
        });

        const position = (columnMaxPosition._max.position ?? -1) + 1;

        const boardColumn = await tx.boardColumn.create({
            data: {
                name: input.name,
                projectId,
                position,
            },
            select: {
                id: true,
                name: true,
                position: true,
                projectId: true,
                createdAt: true,
            }
        });

        return boardColumn;
    });
}

export async function getProjectColumns(projectId: string, currentUserId: string) {
    const currentMembership = await prisma.projectMember.findFirst({
        where: {
            projectId,
            userId: currentUserId,
        },
        select: {
            id: true,
        }
    });

    if (!currentMembership) {
        throw new AppError({ message:"Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
    }

    const projectColumns = await prisma.boardColumn.findMany({
        where: {
            projectId,
        },
        select: {
            id: true,
            name: true,
            position: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            position: "asc",
        }
    });

    return projectColumns;
}

export async function renameBoardColumn(input: RenameBoardColumnInput, projectId: string, columnId: string, currentUserId: string) {
    return prisma.$transaction(async (tx) => {
        const currentMembership = await tx.projectMember.findFirst({
            where: {
                projectId,
                userId: currentUserId,
            },
            select: {
                role: true,
            }
        });

        if (!currentMembership) {
            throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
        }

        if (currentMembership.role === "MEMBER") {
            throw new AppError({ message: "You don't have permission to rename columns", statusCode: 403, code: "FORBIDDEN" });
        }

        const targetColumn = await tx.boardColumn.findFirst({
            where: {
                id: columnId,
                projectId,
            },
            select: {
                id: true,
            }
        });

        if (!targetColumn) {
            throw new AppError({ message: "Column not found", statusCode: 404, code: "COLUMN_NOT_FOUND" });
        }

        const changedColumn = await tx.boardColumn.update({
            where: {
                id: targetColumn.id,
            },
            data: {
                name: input.name,
            },
            select: {
                id: true,
                name: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return changedColumn;

    });
}

export async function deleteBoardColumn(columnId: string, projectId: string, currentUserId: string): Promise<void> {
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
            throw new AppError({message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND"});
        }

        if (currentMembership.role === "MEMBER") {
            throw new AppError({message: "You don't have permission to delete columns", statusCode: 403, code: "FORBIDDEN"});
        }

        const targetColumn = await tx.boardColumn.findFirst({
            where: {
                id: columnId,
                projectId,
            },
            select: {
                id: true,
                position: true,
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
        });

        if (!targetColumn) {
            throw new AppError({message: "Column not found", statusCode: 404, code: "COLUMN_NOT_FOUND"});
        }

        if (targetColumn._count.tasks > 0) {
            throw new AppError({ message: "Column must be empty before deletion", statusCode: 409, code: "COLUMN_NOT_EMPTY" });
        }

        await tx.boardColumn.delete({
            where: {
                id: targetColumn.id,
            },
        });

        await tx.boardColumn.updateMany({
            where: {
                projectId,
                position: {gt: targetColumn.position},
            },
            data: {
                position: {decrement: 1},
            }
        });
    });
}

export async function moveBoardColumn(input: MoveBoardColumnInput, projectId: string, columnId: string, currentUserId: string) {
    return prisma.$transaction(async (tx) => {
        const currentMembership = await tx.projectMember.findFirst({
            where: {
                userId: currentUserId,
                projectId,
            },
            select: {
                role: true,
            },
        });

        if (!currentMembership) {
            throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
        }

        if (currentMembership.role === "MEMBER") {
            throw new AppError({ message: "You don't have permission to move columns", statusCode: 403, code: "FORBIDDEN" });
        }

        const targetColumn = await tx.boardColumn.findFirst({
            where: {
                id: columnId,
                projectId,
            },
            select: {
                id: true,
                name: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!targetColumn) {
            throw new AppError({ message: "Column not found", statusCode: 404, code: "COLUMN_NOT_FOUND" });
        }

        const columnsCount = await tx.boardColumn.count({
            where: {
                projectId,
            },
        });

        if (input.position >= columnsCount) {
            throw new AppError({ message: "Invalid column position", statusCode: 400, code: "INVALID_COLUMN_POSITION" });
        }

        if (targetColumn.position === input.position) {
            return targetColumn;
        }

        if (targetColumn.position < input.position) {
            await tx.boardColumn.updateMany({
                where: {
                    projectId,
                    position: {
                        gt: targetColumn.position,
                        lte: input.position,
                    },
                },
                data: {
                    position: {
                        decrement: 1,
                    },
                },
            });
        } else {
            await tx.boardColumn.updateMany({
                where: {
                    projectId,
                    position: {
                        gte: input.position,
                        lt: targetColumn.position,
                    },
                },
                data: {
                    position: {
                        increment: 1,
                    },
                },
            });
        }

        const movedColumn = await tx.boardColumn.update({
            where: {
                id: targetColumn.id,
            },
            data: {
                position: input.position,
            },
            select: {
                id: true,
                name: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return movedColumn;
    });
}