import type { RequestHandler } from "express";
import type { ProjectIdParams } from "../projects/project.schema.js";
import { createBoardColumn, deleteBoardColumn, getProjectColumns, moveBoardColumn, renameBoardColumn } from "./board-column.service.js";
import type { BoardColumnParams } from "./board-column.schema.js";
import { broadcastToProject } from "../../websocket/websocket.rooms.js";

export const createBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId } = req.params as ProjectIdParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const newColumn = await createBoardColumn(projectId, input, currentUserId);

    broadcastToProject(projectId, {
        type: "COLUMN_CREATED",
        payload: {
            projectId,
            column: {
                id: newColumn.id,
                name: newColumn.name,
                position: newColumn.position,
            },
        },
    });

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

    broadcastToProject(projectId, {
        type: "COLUMN_RENAMED",
        payload: {
            projectId,
            columnId,
            name: renamedColumn.name,
        }
    });

    return res.status(200).json({
        data: renamedColumn,
    });
}

export const deleteBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId, columnId } = req.params as BoardColumnParams;
    const currentUserId = res.locals.userId;

    await deleteBoardColumn(columnId, projectId, currentUserId);

    broadcastToProject(projectId, {
        type: "COLUMN_DELETED",
        payload: {
            projectId,
            columnId,
        }
    });

    return res.status(204).send();
}

export const moveBoardColumnController: RequestHandler = async (req, res) => {
    const { projectId, columnId } = req.params as BoardColumnParams;
    const currentUserId = res.locals.userId;
    const input = req.body;

    const movedColumn = await moveBoardColumn(input, projectId, columnId, currentUserId);

    broadcastToProject(projectId, {
        type: "COLUMN_MOVED",
        payload: {
            projectId,
            columnId,
            position: movedColumn.position,
        }
    });

    return res.status(200).json({
        data: movedColumn,
    });
}