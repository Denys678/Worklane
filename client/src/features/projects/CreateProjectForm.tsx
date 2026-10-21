"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { type FormEvent, useState } from "react";
import type { Project } from "./types";

type CreateProjectFormProps = {
    onProjectCreated: (project: Project) => void;
};

export function CreateProjectForm({ onProjectCreated }:CreateProjectFormProps) {
    const { accessToken } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5001/api/projects", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                }),
            });

            if (!response.ok) {
                setError("Failed to create a new project");
                return;
            }
            const data = await response.json();

            onProjectCreated(data.data);
            setName("");
        } catch {
            setError("Server is unreachable");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="flex w-full max-w-md flex-col gap-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-4xl font-semibold">Create your project</h2>
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
            <button
                type="submit"
                className="text-white text-[18px] bg-zinc-900 rounded-md py-4 px-12 hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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