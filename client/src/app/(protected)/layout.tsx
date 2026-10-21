"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

type ProtectedLayoutProps = {
    children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const { user, isAuthLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthLoading === false && user === null) {
            router.replace("/login")
        }
    }, [isAuthLoading, user, router]);

    if (isAuthLoading) {
        return <p>Checking session...</p>;
    }

    if (!user) {
        return null;
    }

    return children;
}