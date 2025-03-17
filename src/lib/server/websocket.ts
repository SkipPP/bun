// Track active WebSocket connections
const activeConnections = new Set<WebSocket>();

export function setupWebSocketHandlers() {
  return {
    // WebSocket event handlers
    open(ws) {
      console.log("WebSocket connection opened");
      activeConnections.add(ws);
      ws.send(
        JSON.stringify({
          type: "welcome",
          message: "Connected to WebSocket server",
          timestamp: new Date().toISOString(),
        })
      );
    },

    message(ws, message: string) {
      console.log(`Received message: ${message}`);

      // Parse the message if it's a string
      try {
        if (typeof message === "string") {
          // Try to parse as JSON
          const data = JSON.parse(message);

          // Echo the message back with a timestamp
          ws.send(
            JSON.stringify({
              type: "echo",
              data,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (e) {
        // If parsing fails, just echo back the raw message
        ws.send(
          JSON.stringify({
            type: "echo",
            data: message,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },

    close(ws) {
      console.log("WebSocket connection closed");
      activeConnections.delete(ws);
    },

    drain(ws) {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
  };
}

export function getActiveConnections() {
  return activeConnections;
}
