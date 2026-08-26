import z from "zod";

export const createTaskSchema = z.strictObject({
    title: z.string().trim().min(2).max(50),
    description: z.string().max(500).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().optional(),
    columnId: z.string().uuid(),
});

export const taskIdParamsSchema = z.strictObject({
    projectId: z.string().uuid(),
    taskId: z.string().uuid(),
});

export const updateTaskSchema = z.strictObject({
    title: z.string().trim().min(2).max(50).optional(),
    description: z.string().max(500).nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().nullable().optional(),
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
        message: "At least one field must be provided",
    },
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;