"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

type User = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

type LoginResponse = {
    data: {
        accessToken: string;
        user: User;
    };
}

type RefreshResponse = {
    data: {
        accessToken: string;
    };
}

type MeResponse = {
    data: User;
}

type AuthContextValue = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    accessToken: string | null;
    isAuthLoading: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

    const didRestoreSession = useRef(false);

    async function login(email: string, password: string) {
        const response = await fetch("http://localhost:5001/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const data: LoginResponse = await response.json();

        setUser(data.data.user);
        setAccessToken(data.data.accessToken);
    }

    async function logout() {
        const response = await fetch("http://localhost:5001/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Logout failed");
        }

        setAccessToken(null);
        setUser(null);
    }

    async function refreshSession() {
        const refreshResponse = await fetch("http://localhost:5001/api/auth/refresh",
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (!refreshResponse.ok) {
            if (refreshResponse.status === 401) {
                setUser(null);
                setAccessToken(null);
                return;
            }
            throw new Error("Failed to refresh session");
        }

        const refreshData: RefreshResponse = await refreshResponse.json();
        const newAccessToken = refreshData.data.accessToken;

        const meResponse = await fetch("http://localhost:5001/api/auth/me",
            {
                headers: {
                    Authorization: `Bearer ${newAccessToken}`,
                },
            }
        );

        if (!meResponse.ok) {
            if (meResponse.status === 401) {
                setUser(null);
                setAccessToken(null);
                return;
            }
            throw new Error("Failed to fetch current user");
        }

        const meData: MeResponse = await meResponse.json();

        setAccessToken(newAccessToken);
        setUser(meData.data);
    }

    useEffect(() => {
        if (didRestoreSession.current) {
            return;
        }

        didRestoreSession.current = true;

        async function recreateSession() {
            try {
                await refreshSession();
            } catch (error) {
                console.error(error);
            } finally {
                setIsAuthLoading(false);
            }
        }

        void recreateSession();

    }, []);

    return (
        <AuthContext value={{ user, accessToken, isAuthLoading, login, logout }}>
            {children}
        </AuthContext>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}