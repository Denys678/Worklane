import Link from "next/link";
import type { Project } from "./types"

type ProjectListProps = {
    projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
    return (
        <>
            {projects.length === 0 ? (
                <p>No projects yet</p>
            ) : (
                projects.map((project) => {
                    return <Link href={`/projects/${project.id}`} key={project.id}>
                        {project.name}
                    </Link>;
                })
            )}
        </>
    )
}