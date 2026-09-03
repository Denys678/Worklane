import z from "zod";

export const assignTaskMemberSchema = z.strictObject({
    projectMemberId: z.string().uuid(),
});

export const unassignTaskMemberParamsSchema = z.strictObject({
    taskId: z.string().uuid(),
    projectId: z.string().uuid(),
    projectMemberId: z.string().uuid(),
})

export type AssignTaskMemberInput = z.infer<typeof assignTaskMemberSchema>;
export type UnassignTaskMemberParams = z.infer<typeof unassignTaskMemberParamsSchema>;