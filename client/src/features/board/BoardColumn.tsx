import { TaskCard } from "./TaskCard";
import type { BoardColumnType } from "./types"

type BoardColumnProps = {
    column: BoardColumnType;
}

export function BoardColumn({ column }: BoardColumnProps) {
    return (
        <section className="border rounded-md p-2 m-5">
            <h3 className="font-semibold">{column.name}</h3>
            
            {column.tasks.length === 0 && (
                <p>No tasks yet</p>
            )}

            {column.tasks.map((task) => {
                return <TaskCard key={task.id} task={task} />
            })}
        </section>
    )
}