import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { createWebSocketServer } from "./websocket/websocket.server.js";

const PORT = Number(process.env.PORT) || 5001;

const server = createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});