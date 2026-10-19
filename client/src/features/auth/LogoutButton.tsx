"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LogoutButton() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { logout } = useAuth();
    const router = useRouter();

    async function handleSubmit() {
        setIsLoading(true);
        setError("");
        try {
            await logout();
            router.replace("/login");
        } catch {
            setError("Unable to reach server");
            return;
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleSubmit}
                className="text-white text-[18px] bg-red-500 rounded-md py-4 px-12 hover:bg-red-600 cursor-pointer"
                disabled={isLoading}
            >{isLoading ? "Logging out..." : "Logout"}</button>
            
            {error && (
                <p className="text-center font-semibold text-red-900">{error}</p>
            )}

        </div>
    )
}