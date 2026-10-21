"use client";

import { useState, useEffect } from "react";
import { CreateProjectForm } from "./CreateProjectForm";
import { ProjectList } from "./ProjectsList";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Project } from "./types";

export default function ProjectsManager() {
    const { accessToken } = useAuth();

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        async function fetchProjects() {
            setError("");
            setIsLoading(true);

            try {
                const response = await fetch("http://localhost:5001/api/projects", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });

                if (!response.ok) {
                    setError("Failed to load projects");
                    return;
                }

                const data = await response.json();

                setProjects(data.data);
            } catch {
                setError("Server is unreachable");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjects();
    }, [accessToken]);

    function handleProjectCreated(project: Project) {
        setProjects((prev) => [...prev, project]);
    }

    return (
        <section>
            <CreateProjectForm onProjectCreated={handleProjectCreated}/>

            {isLoading ? (
                <p>Loading projects...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ProjectList projects={projects} />
            )}
        </section>
    );
}