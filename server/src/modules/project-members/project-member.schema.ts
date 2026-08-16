import z from "zod";

const roleSchema = z.enum(["MANAGER", "OWNER", "MEMBER"]);

export const addProjectMemberSchema = z.strictObject({
    email: z.string().trim().toLowerCase().email(),
    role: roleSchema,
});

export const projectMemberParamsSchema = z.strictObject({
    projectId: z.string().uuid(),
    memberId: z.string().uuid(),
});

export const updateProjectMemberRoleSchema = z.strictObject({
    role: roleSchema,
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type ProjectMemberParams = z.infer<typeof projectMemberParamsSchema>;
export type UpdateProjectMemberRoleInput = z.infer<typeof updateProjectMemberRoleSchema>;