import { BoardView } from "@/features/board/BoardView";

type ProjectBoardProps = {
    params: Promise<{
        projectId: string;
    }>;
};

export default async function ProjectBoard({params}: ProjectBoardProps) {
    const { projectId } = await params;
    
    return <BoardView projectId={projectId} />;
}