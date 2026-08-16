import type { RequestHandler } from "express";
import type { ProjectIdParams } from "../projects/project.schema.js";
import { createBoardColumn, deleteBoardColumn, getProjectColumns, moveBoardColumn, renameBoardColumn } from "./board-column.service.js";
import type { BoardColumnParams } from "./board-column.schema.js";

export const createBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const newColumn = await createBoardColumn(projectId, input, currentUserId);

    return res.status(201).json({
        data: newColumn 
    });
}

export const getProjectColumnsController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;

    const projectColumns = await getProjectColumns(projectId, currentUserId);

    return res.status(200).json({
        data: projectColumns,
    })
}

export const renameBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId, columnId } = req.params as BoardColumnParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const renamedColumn = await renameBoardColumn(input, projectId, columnId, currentUserId);

    return res.status(200).json({
        data: renamedColumn,
    });
}

export const deleteBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId, columnId } = req.params as BoardColumnParams;
    const currentUserId = res.locals.userId;

    await deleteBoardColumn(columnId, projectId, currentUserId);

    return res.status(204).send();
}

export const moveBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId, columnId } = req.params as BoardColumnParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const movedColumn = await moveBoardColumn(input, projectId, columnId, currentUserId);

    return res.status(200).json({
        data: movedColumn,
    });
}