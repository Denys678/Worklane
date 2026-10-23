export type BoardColumnType = {
    id: string;
    name: string;
    position: number;
    tasks: BoardTask[];
};

export type TaskPriorityType = "LOW" | "MEDIUM" | "HIGH";

export type BoardTask = {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriorityType;
    dueDate: string | null;
    position: number;
    columnId: string;
};