import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3000,
  host: "0.0.0.0", // specify host so that remoteAddress is shown as ipv4
});

export const clients: Map<string, WebSocket> = new Map();

wss.on("connection", (ws, request) => {
  ws.onerror = (error) => {};
  const clientIp = request.socket.remoteAddress;
  if (!clientIp) return;
  clients.set(clientIp, ws);
  console.log("ip", clientIp);

  ws.on("close", () => {
    console.log("close 123", clientIp);
    clients.delete(clientIp);
  });
});
