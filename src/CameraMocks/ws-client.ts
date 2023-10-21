#!/usr/bin/env node
import WebSocket from "ws";

type Message = {
  pan: number;
  tilt: number;
  zoom: number;
  focus: boolean;
};

export function startConnection(cameraId: Number) {
  function log(...args: any[]) {
    console.log(`[Camera: ${cameraId}] `, ...args);
  }

  let ws = new WebSocket("ws://127.0.0.1:3000");
  let timeout: NodeJS.Timeout;
  ws.onerror = (error) => {
    log(`error: ${error}`);
    // setTimeout(() => {
    //   connect();
    // }, 1000);
  };

  ws.on("open", () => {
    log("open");
    ws.send(JSON.stringify({ ID: cameraId }));
  });

  ws.on("message", (data: Buffer) => {
    const message = JSON.parse(data.toString()) as Message;
    log("message ", message);
  });

  // reconnect if connection is closed
  ws.on("close", () => {
    log("close");
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      startConnection(cameraId);
    }, 1000);
  });
}
