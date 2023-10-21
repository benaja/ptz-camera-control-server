import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3000,
  host: "0.0.0.0", // specify host so that remoteAddress is shown as ipv4
});

export const clients: Map<number, WebSocket> = new Map();

type Message = {
  ID: number;
};

let listeners: ((cameraId: number) => void)[] = [];

export const registerCameraConnectedListener = (
  callback: (cameraId: number) => void
) => {
  listeners.push(callback);
};

wss.on("connection", (ws, request) => {
  let cameraId: number;
  ws.onerror = (error) => {};

  ws.on("message", (data: Buffer) => {
    let message = JSON.parse(data.toString()) as Message;
    console.log("message from client:", message);

    clients.set(message.ID, ws);
    listeners.forEach((l) => l(message.ID));
    cameraId = message.ID;
  });

  ws.on("close", () => {
    console.log("close", cameraId);
    clients.delete(cameraId);
  });
});
