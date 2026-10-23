import type { BoardTask, TaskPriorityType } from "./types";

type TaskCardProps = {
    task: BoardTask;
    onTaskSelected: (task: BoardTask) => void;
}

export const priorityStyles: Record<TaskPriorityType, string> = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
};

export function TaskCard({ task, onTaskSelected }: TaskCardProps) {
    return (
        <button 
            className="text-left flex flex-col border rounded-md p-3 text-white bg-zinc-800 gap-4 hover: cursor-pointer" 
            type="button" 
            onClick={() => onTaskSelected(task)}
        >
            <p className="text-sm font-semibold">{task.title}</p>
            {task.description && (
                <p className="line-clamp-2">
                    {task.description}
                </p>
            )}
            <div className="flex items-center justify-between">
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyles[task.priority]}`} >{task.priority}</span>
                {task.dueDate && (
                <p>
                    Due: {new Date(task.dueDate).toLocaleDateString("uk-UA")}
                </p>
            )}
            </div>
        </button>
    )
}