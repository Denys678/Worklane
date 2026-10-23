"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { type FormEvent, useState } from "react";
import type { BoardColumnType } from "./types";

type CreateColumnFormProps = {
    projectId: string;
    onColumnCreated: (column: BoardColumnType) => void;
};

export function CreateColumnForm({ projectId, onColumnCreated }: CreateColumnFormProps) {
    const { accessToken } = useAuth();
    
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsLoading(true);

        try{
            const response = await fetch(`http://localhost:5001/api/projects/${projectId}/columns`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                }),
            });

            if(!response.ok) {
                setError("Column was not created");
                return;
            }

            const data = await response.json();

            onColumnCreated({...data.data, tasks: []});
            setName("");
        } catch {
            setError("Server is unreachable");
        } finally {
            setIsLoading(false);
        }
    }

     return (
        <form className="flex w-full max-w-md flex-col gap-4 border rounded-md p-4 mt-4" onSubmit={handleSubmit}>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Name
                </legend>

                <input
                    type="text"
                    name="name"
                    value={name}
                    required
                    minLength={2}
                    maxLength={50}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full outline-none"
                />
            </fieldset>
            <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
                disabled={isLoading}
            >
                {isLoading ? "Creating ..." : "Create"}
            </button>
            {error && (
                <p className="text-center font-semibold text-red-900">{error}</p>
            )}
        </form>
    )
}   