"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useState } from "react";
import type { FormEvent } from "react";
import { LogoutButton } from "./LogoutButton";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);

    const { login, user, isAuthLoading } = useAuth();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
        } catch {
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="flex w-full max-w-md flex-col gap-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-4xl font-semibold">Login</h2>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Email
                </legend>

                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full outline-none"
                />
            </fieldset>
            <fieldset className="w-full rounded-md border p-2 focus-within:border-zinc-900">
                <legend className="px-1 text-sm">
                    Password
                </legend>

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
            {isAuthLoading ? (
                <p>Checking session...</p>
            ): user ? (
                <>
                    <p>{user.name}</p>
                    <LogoutButton />
                </>
            ) : (
                <p>Not authenticated</p>
            )}
            <button
                type="submit"
                className="text-white text-[18px] bg-zinc-900 rounded-md py-4 px-12 hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
            >
                {isLoading ? "Logging in ..." : "Login"}
            </button>
        </form>
    );
}