import type { RequestHandler } from "express";
import type { ProjectIdParams } from "../projects/project.schema.js";
import type { CreateTaskInput, MoveTaskInput, TaskIdParams, UpdateTaskInput } from "./task.schema.js";
import { createTask, deleteProjectTask, getProjectTask, getProjectTasks, moveTask, updateTask } from "./task.service.js";
import { broadcastToProject } from "../../websocket/websocket.rooms.js";

export const createTaskController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const { projectId } = req.params as ProjectIdParams;
    const input = req.body as CreateTaskInput;

    const newTask = await createTask(input, currentUserId, projectId);

    broadcastToProject(projectId, {
        type: "TASK_CREATED",
        payload: {
            projectId,
            task: {
                id: newTask.id,
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                dueDate: newTask.dueDate?.toISOString() ?? null,
                columnId: newTask.columnId,
                position: newTask.position,
                createdAt: newTask.createdAt.toISOString(),
                updatedAt: newTask.updatedAt.toISOString(),
            },
        },
    });

    return res.status(201).json({
        data: newTask,
    });
}

export const getProjectTasksController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const { projectId } = req.params as ProjectIdParams;

    const tasks = await getProjectTasks(currentUserId, projectId);

    return res.status(200).json({
        data: tasks,
    });
}

export const getProjectTaskController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const { projectId, taskId } = req.params as TaskIdParams;

    const task = await getProjectTask(projectId, taskId, currentUserId);

    return res.status(200).json({
        data: task,
    });
}

export const updateTaskController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const {projectId, taskId} = req.params as TaskIdParams;
    const input = req.body as UpdateTaskInput;

    const task = await updateTask(projectId, currentUserId, taskId, input);

    broadcastToProject(projectId, {
        type: "TASK_UPDATED",
        payload: {
            projectId,
            task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate?.toISOString() ?? null,
                columnId: task.columnId,
                position: task.position,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString(),
            },
        },
    });

    return res.status(200).json({
        data: task,
    });
}

export const deleteProjectTaskController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const {projectId, taskId} = req.params as TaskIdParams;

    await deleteProjectTask(projectId, taskId, currentUserId);

    broadcastToProject(projectId, {
        type: "TASK_DELETED",
        payload: {
            projectId,
            taskId,
        },
    });

    return res.status(204).send();
}

export const moveTaskController: RequestHandler = async (req, res) => {
    const currentUserId = res.locals.userId;
    const {projectId, taskId} = req.params as TaskIdParams;
    const input = req.body as MoveTaskInput;

    const movedTask = await moveTask(projectId, taskId, currentUserId, input);

    broadcastToProject(projectId, {
        type: "TASK_MOVED",
        payload: {
            projectId,
            taskId,
            columnId: movedTask.columnId,
            position: movedTask.position,
        },
    });

    return res.status(200).json({
        data: movedTask,
    })
}