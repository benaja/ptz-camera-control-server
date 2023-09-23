#!/usr/bin/env node
import WebSocket from "ws";

function connect() {
  let ws = new WebSocket("ws://192.168.0.31:3000");
  ws.onerror = (error) => {
    console.log("error", error);
    // setTimeout(() => {
    //   connect();
    // }, 1000);
  };

  ws.on("open", () => {
    console.log("open");
    ws.send("something");
  });

  // reconnect if connection is closed
  ws.on("close", () => {
    console.log("close");
    setTimeout(() => {
      connect();
    }, 1000);
  });
}

connect();
