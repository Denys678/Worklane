import type { RequestHandler } from "express";
import type { ProjectIdParams } from "../projects/project.schema.js";
import { getProjectBoard } from "./board.service.js";

export const getProjectBoardController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;

    const board = await getProjectBoard(currentUserId, projectId);

    return res.status(200).json({
        data: board,
    });
}