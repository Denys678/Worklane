"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { type FormEvent, useState } from "react";
import type { BoardTask, TaskPriorityType } from "./types";

type CreateTaskFormProps = {
    projectId: string;
    columnId: string;
    onTaskCreated: (task: BoardTask) => void;
}

export function CreateTaskForm({ projectId, columnId, onTaskCreated }: CreateTaskFormProps) {
    const { accessToken } = useAuth();

    const [name, setName] = useState("");
    const [priority, setPriority] = useState<TaskPriorityType>("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:5001/api/projects/${projectId}/tasks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: name,
                    priority,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    description: description.trim() || undefined,
                    columnId,
                }),
            });

            if (!response.ok) {
                setError("Task was not created");
                return;
            }

            const data = await response.json();

            onTaskCreated(data.data);
            
            setName("");
            setPriority("MEDIUM");
            setDescription("");
            setDueDate("");
        } catch {
            setError("Server is unreachable");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="flex w-full max-w-md flex-col gap-2" onSubmit={handleSubmit}>
            <h2 className="text-center font-semibold">Create task</h2>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Name
                </legend>

                <input
                    type="text"
                    name="name"
                    value={name}
                    required
                    onChange={(event) => setName(event.target.value)}
                    className="w-full outline-none"
                />
            </fieldset>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Priority
                </legend>

                <select className="w-full outline-none" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriorityType)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                </select>
            </fieldset>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Description
                </legend>

                <textarea 
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    className="w-full outline-none"
                />
            </fieldset>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Due date
                </legend>

                <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full outline-none"
                />
            </fieldset>
            <button
                type="submit"
                className="text-white text-[12px] bg-zinc-900 rounded-md py-1 px-4 hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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