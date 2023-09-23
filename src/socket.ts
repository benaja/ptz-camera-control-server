const WebSocket = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client verbunden.");

  // Nachricht vom Client empfangen
  ws.on("message", (message) => {
    console.log(`Nachricht empfangen: ${message}`);

    // Hier können Sie auf die empfangenen Nachrichten reagieren und
    // Nachrichten an den Client senden, z.B.:
    // ws.send('Hallo, Client!');
  });

  // Wenn die Verbindung zum Client geschlossen wird
  ws.on("close", () => {
    console.log("Client getrennt.");
  });
});

server.listen(8080, () => {
  console.log("WebSocket-Server läuft auf Port 8080");
});
