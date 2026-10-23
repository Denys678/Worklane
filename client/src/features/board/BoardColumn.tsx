import { CreateTaskForm } from "./CreateTaskForm";
import { TaskCard } from "./TaskCard";
import type { BoardColumnType, BoardTask } from "./types"

type BoardColumnProps = {
    column: BoardColumnType;
    projectId: string;
    isFormOpen: boolean;
    onTaskSelected: (task: BoardTask) => void;
    onTaskCreated: (task: BoardTask) => void;
    onToggleForm: () => void;
}

export function BoardColumn({ column, projectId, isFormOpen, onTaskCreated, onToggleForm, onTaskSelected }: BoardColumnProps) {
    return (
        <section className="w-72 shrink-0 rounded-md bg-zinc-200 p-3">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{column.name}</h3>
                <span className="rounded-full bg-zinc-400 px-2 py-0.5 text-xs">{column.tasks.length}</span>
            </div>

            {column.tasks.length === 0 && (
                <p className="my-3 text-sm text-zinc-500">No tasks yet</p>
            )}

            <div className="flex flex-col gap-4">
                {column.tasks.map((task) => {
                    return <TaskCard key={task.id} task={task} onTaskSelected={onTaskSelected}/>
                })}
            </div>

            <button className="w-full rounded-md p-2 text-center text-sm hover:bg-zinc-300" type="button" onClick={onToggleForm}>
                {isFormOpen ? "Cancel" : "Add task"}
            </button>

            {isFormOpen && (
                <CreateTaskForm projectId={projectId} columnId={column.id} onTaskCreated={onTaskCreated} />
            )}
        </section>
    )
}