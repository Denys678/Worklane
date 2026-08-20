import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { clientMessageSchema } from "./websocket.schema.js";
import { verifyAccessToken } from "../common/utils/jwt.js";
import prisma from "../lib/prisma.js";
import { joinProjectRoom, leaveProjectRoom, removeSocketFromRooms } from "./websocket.rooms.js";


type ClientState = {
    userId: string | null,
};

export function createWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });
    const clients = new Map<WebSocket, ClientState>();

    wss.on("connection", (socket) => {
        clients.set(socket, { userId: null });
        console.log("WebSocket client connected");

        const client = clients.get(socket);
        if (!client) {
            return;
        }

        socket.on("message", async (rawMessage) => {
            try {
                const parsedJson = JSON.parse(rawMessage.toString());
                const result = clientMessageSchema.safeParse(parsedJson);

                if (!result.success) {
                    console.log("Invalid WebSocket message", result.error.issues);
                    return;
                }

                const message = result.data;

                switch (message.type) {
                    case "SUBSCRIBE_PROJECT": {
                        if (client.userId === null) {
                            console.log("SUBSCRIBE_PROJECT rejected: client is not authenticated");
                            break;
                        }

                        const projectId = message.payload.projectId;

                        const currentMembership = await prisma.projectMember.findFirst({
                            where: {
                                userId: client.userId,
                                projectId: message.payload.projectId,
                            },
                            select: {
                                id: true,
                            }
                        });

                        if (!currentMembership) {
                            console.log("SUBSCRIBE_PROJECT rejected: project not found");
                            break;
                        }

                        joinProjectRoom(projectId, socket);

                        console.log("WebSocket subscribed on project", projectId);
                        break;
                    }

                    case "UNSUBSCRIBE_PROJECT": {
                        if (client.userId === null) {
                            break;
                        }

                        const projectId = message.payload.projectId;
                        
                        leaveProjectRoom(projectId, socket);
                        
                        console.log("WebSocket unsubscribed from project", projectId);
                        break;
                    }

                    case "AUTH": {
                        if (client.userId !== null) {
                            console.log("AUTH ignored: client is already authenticated");
                            break;
                        }

                        try {
                            const userId = await verifyAccessToken(message.payload.accessToken);
                            client.userId = userId;

                            console.log(`WebSocket authenticated: ${userId}`);
                        } catch {
                            console.log("WebSocket authentication failed");
                            socket.close();
                        }

                        break;
                    }
                }
            } catch {
                console.error("Invalid JSON data");
            }
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

        socket.on("close", (code, reason) => {
            clients.delete(socket);
            
            removeSocketFromRooms(socket);
            console.log("WebSocket client disconnected", code, reason.toString());
        });
    });

    return wss;
}