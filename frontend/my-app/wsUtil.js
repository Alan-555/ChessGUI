const WebSocket = require('ws');
const readline = require('readline');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server started on ws://localhost:${PORT}`);

// Track all connected clients
const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  console.log('[+] New client connected');

  ws.on('message', message => {
    console.log(`[Client →] ${message}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('[-] Client disconnected');
  });
});

// Read from stdin and send to all clients as JSON
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', line => {
  try {
    const json = JSON.parse(line);
    const jsonString = JSON.stringify(json);
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(jsonString);
      }
    });
    console.log(`[Server →] ${jsonString}`);
  } catch (err) {
    console.error('Invalid JSON:', err.message);
  }
});
