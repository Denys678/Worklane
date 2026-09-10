import WebSocket from "ws";
import type { ProjectEvent } from "./websocket.schema.js";

const rooms = new Map<string, Map<WebSocket, string>>();

export function joinProjectRoom(projectId: string, socket: WebSocket, userId: string) {
    let room = rooms.get(projectId);

    if (!room) {
        room = new Map<WebSocket, string>();
        rooms.set(projectId, room);
    }

    room.set(socket, userId);
}

export function leaveProjectRoom(projectId: string, socket: WebSocket) {
    const room = rooms.get(projectId);

    if (!room) {
        return;
    }

    room.delete(socket);

    if (room.size === 0) {
        rooms.delete(projectId);
    }
}

export function removeSocketFromRooms(socket: WebSocket) {
    for (const [projectId, room] of rooms) {
        room.delete(socket);

        if (room.size === 0) {
            rooms.delete(projectId);
        }
    }
}

export function removeUserFromProjectRoom(projectId: string, userId: string) {
    const room = rooms.get(projectId);

    if (!room) {
        return;
    }

    for (const [socket, socketUserId] of room) {
        if (socketUserId === userId) {
            room.delete(socket);
        }
    }

    if (room.size === 0) {
        rooms.delete(projectId);
    }
}

export function broadcastToProject(projectId: string, event: ProjectEvent) {
    const room = rooms.get(projectId);

    if (!room) {
        return;
    }

    const serializedEvent = JSON.stringify(event);

    for (const socket of room.keys()) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(serializedEvent);
        }
    }
}