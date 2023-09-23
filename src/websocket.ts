import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3000,
  host: "0.0.0.0", // specify host so that remoteAddress is shown as ipv4
});

const clients: Map<string, WebSocket> = new Map();

wss.on("connection", (ws, request) => {
  const clientIp = request.socket.remoteAddress;
  if (!clientIp) return;
  clients.set(clientIp, ws);
  console.log("ip", clientIp);
  ws.on("message", (message: any) => {
    console.log("received: %s", message);
  });

  ws.on("close", () => {
    console.log("close", clientIp);
    clients.delete(clientIp);
  });
});
