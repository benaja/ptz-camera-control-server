#!/usr/bin/env node
import WebSocket from "ws";

type Message = {
  pan: number;
  tilt: number;
  zoom: number;
  focus: boolean;
};

function connect() {
  let ws = new WebSocket("ws://192.168.0.31:3000");
  let timeout: NodeJS.Timeout;
  ws.onerror = (error) => {
    console.log("error");
    // setTimeout(() => {
    //   connect();
    // }, 1000);
  };

  ws.on("open", () => {
    console.log("open");
    ws.send("something");
  });

  ws.on("message", (data: Buffer) => {
    const message = JSON.parse(data.toString()) as Message;
    console.log("message ", message);
  });

  // reconnect if connection is closed
  ws.on("close", () => {
    console.log("close");
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      connect();
    }, 1000);
  });
}

connect();
