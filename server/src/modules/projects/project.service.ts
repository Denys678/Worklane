import prisma from "../../lib/prisma.js";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schema.js";
import { AppError } from "../../common/errors/AppError.js";

export async function createProject(input: CreateProjectInput, ownerId: string) {
    const result = await prisma.$transaction(async (tx) => {
        const createdProject = await tx.project.create({
            data: {
                name: input.name,
                description: input.description ?? null,
            }
        });

     await tx.projectMember.create({
            data: {
                userId: ownerId,
                projectId: createdProject.id,
                role: "OWNER",
            }
        });

        return createdProject;
    });

    return result;
}

export async function getUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return projects;
}

export async function getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            members: {
                some: {
                    userId,
                }
            }
        }
    });

    if (!project) {
        throw new AppError({message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND"});
    }

    return project;
}

export async function updateProjectById(input: UpdateProjectInput, projectId: string, userId: string) {
    const data = {
        ...(input.name !== undefined && {
            name: input.name,
        }),
        ...(input.description !== undefined && {
            description: input.description,
        }),
    };

    const updatedProject = await prisma.project.update({
        where: {
            id: projectId,
            members: {
                some: {
                    userId,
                    role: "OWNER",
                },
            },
        },
        data,
    });

    return updatedProject;
}

export async function deleteProjectById(projectId: string, userId: string) {
    const result = await prisma.project.deleteMany({
        where: {
            id: projectId,
            members: {
                some: {
                    userId,
                    role: "OWNER",
                }
            }
        }
    });

    if (result.count === 0) {
        throw new AppError({message: "Project wasn't found", statusCode: 404, code: "PROJECT_NOT_FOUND"});
    }
}