import z from "zod";

export const createBoardColumnSchema = z.strictObject({
    name: z.string().trim().min(2).max(50),
});

export const renameBoardColumnSchema = z.strictObject({
    name: z.string().trim().min(2).max(50),
});

export const boardColumnParamsSchema = z.strictObject({
    projectId: z.string().uuid(),
    columnId: z.string().uuid(),
});

export const moveBoardColumnSchema = z.strictObject({
    position: z.int().nonnegative(),
});

export type CreateBoardColumnInput = z.infer<typeof createBoardColumnSchema>;
export type RenameBoardColumnInput = z.infer<typeof renameBoardColumnSchema>;
export type BoardColumnParams = z.infer<typeof boardColumnParamsSchema>;
export type MoveBoardColumnInput = z.infer<typeof moveBoardColumnSchema>;