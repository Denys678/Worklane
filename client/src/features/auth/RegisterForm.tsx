"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try{
            const response = await fetch("http://localhost:5001/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password, 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            router.replace("/login");
        } catch {
            setError("Unable to connect to server");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="flex w-full max-w-md flex-col gap-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-4xl font-semibold">Register</h2>
            <fieldset className="w-full rounded-md border p-2">
                <legend className="px-1 text-sm">Name</legend>
                <input 
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full outline-none" 
                />
            </fieldset>
            <fieldset className="w-full rounded-md border p-2">
                <legend className="px-1 text-sm">Email</legend>
                <input 
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full outline-none"
                />
            </fieldset>
            <fieldset className="w-full rounded-md border p-2">
                <legend className="px-1 text-sm">Password</legend>
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)} 
                    className="w-full outline-none"
                />
            </fieldset>
                        {error && (
                <p className="text-center font-semibold text-red-900">{error}</p>
            )}
            <button 
                type="submit"
                className="text-white text-[18px] bg-zinc-900 rounded-md py-4 px-12 hover:bg-zinc-800 cursor-pointer"
                disabled={isLoading}
            >
                {isLoading ? "Registering..." : "Register"}</button>
        </form>
    )
}