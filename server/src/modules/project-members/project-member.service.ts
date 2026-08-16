import { AppError } from "../../common/errors/AppError.js";
import prisma from "../../lib/prisma.js";
import type { AddProjectMemberInput, UpdateProjectMemberRoleInput } from "./project-member.schema.js";

export async function addProjectMember(input: AddProjectMemberInput, projectId: string, currentUserId: string) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            members: {
                some: {
                    userId: currentUserId,
                    role: "OWNER",
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!project) {
        throw new AppError({message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND"});
    }

    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
        select: {
            id: true,
        },
    });

    if (!user) {
        throw new AppError({message: "User not found", statusCode: 404, code: "USER_NOT_FOUND"});
    }

    const existingMember = await prisma.projectMember.findFirst({
        where: {
            userId: user.id,
            projectId: project.id,
        }
    });

    if (existingMember) {
        throw new AppError({message: "User is already a project member", statusCode: 409, code: "PROJECT_MEMBER_ALREADY_EXISTS"});
    }

    const newMember = await prisma.projectMember.create({
        data: {
            projectId,
            userId: user.id,
            role: input.role,
        }
    });

    return newMember;
}

export async function getProjectMembers(projectId: string, currentUserId: string) {
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
        throw new AppError({message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND"});
    }

    const projectMembers = await prisma.projectMember.findMany({
        where: {
            projectId,
        },
        select: {
            id: true,
            role: true,
            joinedAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,

                }
            }
        },
        orderBy: {
            joinedAt: "asc",
        }
    });

    return projectMembers;
}

export async function updateProjectMemberRole(input: UpdateProjectMemberRoleInput, projectId: string, memberId: string, currentUserId: string) {
    return prisma.$transaction(async (tx) => {
        const currentMembership = await tx.projectMember.findFirst({
            where: {
                projectId,
                userId: currentUserId,
            },
            select: {
                role: true,
            },
        });

        if (!currentMembership) {
            throw new AppError({ message: "Project not found", statusCode: 404, code: "PROJECT_NOT_FOUND" });
        }

        if (currentMembership.role !== "OWNER") {
            throw new AppError({ message: "You don't have permission to change member roles", statusCode: 403, code: "FORBIDDEN" });
        }

        const targetMember = await tx.projectMember.findFirst({
            where: {
                id: memberId,
                projectId,
            },
            select: {
                id: true,
                role: true,
            },
        });

        if (!targetMember) {
            throw new AppError({ message: "Project member not found", statusCode: 404, code: "PROJECT_MEMBER_NOT_FOUND" });
        }

        const isOwnerBeingDemoted = targetMember.role === "OWNER" && input.role !== "OWNER";

        if (isOwnerBeingDemoted) {
            const ownersCount = await tx.projectMember.count({
                where: {
                    projectId,
                    role: "OWNER",
                },
            });

            if (ownersCount === 1) {
                throw new AppError({ message: "The last project owner cannot be demoted", statusCode: 409, code: "LAST_PROJECT_OWNER" });
            }
        }

        const updatedMember = await tx.projectMember.update({
            where: {
                id: targetMember.id,
            },
            data: {
                role: input.role,
            },
            select: {
                id: true,
                role: true,
                joinedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return updatedMember;
    });
}

export async function deleteProjectMember(currentUserId: string, memberId: string, projectId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
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

        const targetMember = await tx.projectMember.findFirst({
            where: {
                id: memberId,
                projectId,
            },
            select: {
                id: true,
                role: true,
            },
        });

        if (!targetMember) {
            throw new AppError({ message: "Project member not found", statusCode: 404, code: "PROJECT_MEMBER_NOT_FOUND" });
        }

        if (currentMembership.role === "MEMBER") {
            throw new AppError({ message: "You don't have permission to remove project members", statusCode: 403, code: "FORBIDDEN" });
        }

        if (currentMembership.role === "MANAGER" && targetMember.role !== "MEMBER") {
            throw new AppError({ message: "Managers can remove only members", statusCode: 403, code: "FORBIDDEN" });
        }

        if (targetMember.role === "OWNER") {
            const ownersCount = await tx.projectMember.count({
                where: {
                    projectId,
                    role: "OWNER",
                },
            });

            if (ownersCount === 1) {
                throw new AppError({ message: "The last project owner cannot be removed", statusCode: 409, code: "LAST_PROJECT_OWNER" });
            }
        }

        await tx.projectMember.delete({
            where: {
                id: targetMember.id,
            },
        });
    });
}