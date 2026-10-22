import type { BoardTask } from "./types";

type TaskCardProps = {
    task: BoardTask;
}

export function TaskCard({ task }: TaskCardProps) {
    return (
        <section className="border rounded-md p-3 m-2 mb-4 text-white bg-zinc-800">
            <h4 className="font-semibold text-lg">{task.title}</h4>
            <p>Priority: {task.priority}</p>
            {task.description && (
                <p>
                    {task.description}
                </p>
            )}
            {task.dueDate && (
                <p>
                    Due date: {new Date(task.dueDate).toLocaleDateString("uk-UA")}
                </p>
            )}
        </section>
    )
}