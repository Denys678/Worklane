import z from "zod";

const subscribeProjectSchema = z.strictObject({
    type: z.literal("SUBSCRIBE_PROJECT"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
    }),
});

const unsubscribeProjectSchema = z.strictObject({
    type: z.literal("UNSUBSCRIBE_PROJECT"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
    }),
});

const authSchema = z.strictObject({
    type: z.literal("AUTH"),
    payload: z.strictObject({
        accessToken: z.string().nonempty(),
    }),
});

const columnCreatedEventSchema = z.strictObject({
    type: z.literal("COLUMN_CREATED"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
        column: z.strictObject({
            id: z.string().uuid(),
            name: z.string().trim().min(2).max(50),
            position: z.int().nonnegative(),
        }),
    }),
});

const columnRenamedEventSchema = z.strictObject({
    type: z.literal("COLUMN_RENAMED"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
        columnId: z.string().uuid(),
        name: z.string().trim().min(2).max(50),
    }),
});

const columnDeletedEventSchema = z.strictObject({
    type: z.literal("COLUMN_DELETED"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
        columnId: z.string().uuid(), 
    }),
});

const columnMovedEventSchema = z.strictObject({
    type: z.literal("COLUMN_MOVED"),
    payload: z.strictObject({
        projectId: z.string().uuid(),
        columnId: z.string().uuid(),
        position: z.int().nonnegative(), 
    }),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
    subscribeProjectSchema,
    unsubscribeProjectSchema,
    authSchema,
]);

export const projectEventSchema = z.discriminatedUnion("type", [
    columnCreatedEventSchema,
    columnRenamedEventSchema,
    columnDeletedEventSchema,
    columnMovedEventSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ProjectEvent = z.infer<typeof projectEventSchema>;