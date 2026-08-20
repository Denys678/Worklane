import WebSocket from "ws";
import type { ProjectEvent } from "./websocket.schema.js";

const rooms = new Map<string, Set<WebSocket>>();

export function joinProjectRoom(projectId: string, socket: WebSocket) {
    let room = rooms.get(projectId);

    if (!room) {
        room = new Set<WebSocket>();
        rooms.set(projectId, room);
    }

    room.add(socket);
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

export function broadcastToProject(projectId: string, event: ProjectEvent) {
    const room = rooms.get(projectId);

    if (!room) {
        return;
    }

    const serializedEvent = JSON.stringify(event);
    for (const socket of room) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(serializedEvent);
        }
    }
}