"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { CreateColumnForm } from "./CreateColumnForm";
import type { BoardColumn } from "./types";

type BoardViewProps = {
    projectId: string;
}

type Board = {
    id: string;
    name: string;
    columns: BoardColumn[];
}

export function BoardView({ projectId }: BoardViewProps) {
    const { accessToken } = useAuth();

    const [board, setBoard] = useState<Board | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    function handleColumnCreated(newColumn: BoardColumn) {
        setBoard((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                columns: [...prev.columns, newColumn],
            };
        });
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
            <h1>{board.name}</h1>
            {board.columns.length === 0 && (
                <p>No columns yet</p>
            )}

            {board.columns.map((column) => {
                return <p key={column.id}>{column.name}</p>
            })}

            <CreateColumnForm projectId={projectId} onColumnCreated={handleColumnCreated} />
        </section>
    )
}