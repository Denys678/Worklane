export type BoardColumnType = {
    id: string;
    name: string;
    position: number;
    tasks: BoardTask[];
};

export type BoardTask = {
    id: string;
    title: string;
    position: number;
    columnId: string;
};