"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { CreateColumnForm } from "./CreateColumnForm";
import type { BoardColumnType, BoardTask } from "./types";
import { BoardColumn } from "./BoardColumn";

type BoardViewProps = {
    projectId: string;
}

type Board = {
    id: string;
    name: string;
    columns: BoardColumnType[];
}

export function BoardView({ projectId }: BoardViewProps) {
    const { accessToken } = useAuth();

    const [board, setBoard] = useState<Board | null>(null);

    const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
    const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    function handleColumnCreated(newColumn: BoardColumnType) {
        setBoard((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                columns: [...prev.columns, newColumn],
            };
        });
        setIsColumnFormOpen(false);
    }

    function handleTaskCreated(newTask: BoardTask) {
        setBoard((prev) => {
            if (!prev) return prev;

            const updatedColumns = prev.columns.map((column) => {
                if (column.id !== newTask.columnId) {
                    return column;
                }

                return { ...column, tasks: [...column.tasks, newTask] };
            });

            return { ...prev, columns: updatedColumns };
        });

        setActiveColumnId(null);
    }


    useEffect(() => {
        if (!accessToken) {
            return;
        }

        async function getBoardData() {
            setIsLoading(true);
            setError("");

            try {
                const response = await fetch(`http://localhost:5001/api/projects/${projectId}/board`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });

                if (!response.ok) {
                    setError("Failed to load the board");
                    return;
                }

                const data = await response.json();
                setBoard(data.data);

            } catch {
                setError("Server is unreachable");
            } finally {
                setIsLoading(false);
            }
        }

        getBoardData();
    }, [accessToken, projectId]);

    if (isLoading) {
        return <p>board is loading...</p>;
    }

    if (error) {
        return <p>{error}</p>
    }

    if (board === null) {
        return <p>There is no board</p>;
    }

    return (
        <section>
            <h1 className="text-4xl font-semibold ml-10 mt-10 mb-15">{board.name}</h1>
            {board.columns.length === 0 && (
                <p>No columns yet</p>
            )}

            <div className="flex w-full min-w-0 items-start gap-4 overflow-x-auto p-4">
                {board.columns.map((column) => (
                    <BoardColumn
                        key={column.id}
                        column={column}
                        projectId={projectId}
                        isFormOpen={activeColumnId === column.id}
                        onTaskCreated={handleTaskCreated}
                        onToggleForm={() => {
                            setActiveColumnId((prev) => {
                                return prev === column.id ? null : column.id;
                            });
                        }}
                    />
                ))}
                <div className="w-72 shrink-0">
                    <button
                        type="button"
                        className="w-full rounded-md border border-dashed p-3 text-center hover:bg-zinc-100"
                        onClick={() => setIsColumnFormOpen((prev) => !prev)}
                    >
                        {isColumnFormOpen ? "Cancel" : "+ Add column"}
                    </button>

                    {isColumnFormOpen && (
                        <CreateColumnForm projectId={projectId} onColumnCreated={handleColumnCreated} />
                    )}
                </div>
            </div>

        </section>
    )
}