import { createServer, type IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { startWatchdog } from "./watchdog.js";
import { handleRelayConnection } from "./voice/relay-ws.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const RELAY_PATHS = new Set(["/api/voice/relay", "/voice/relay"]);

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request: IncomingMessage, socket, head) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (!RELAY_PATHS.has(pathname)) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    handleRelayConnection(ws, request);
  });
});

server.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening (HTTP + Voice WebSocket)");
  startWatchdog();
});
