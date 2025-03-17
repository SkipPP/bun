import { serve } from "bun";

import index from "./index.html";
import { setupWebSocketHandlers } from "./lib/server/websocket";

// Track active WebSocket connections
const activeConnections = new Set<WebSocket>();

const server = serve({
  fetch(req, server) {
    // Handle WebSocket upgrade requests
    if (req.url.includes("/ws")) {
      const upgraded = server.upgrade(req);

      if (upgraded) {
        // If upgrade was successful, return a response to prevent further processing
        return new Response(null, { status: 101 });
      }

      // If upgrade failed, return an error response
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // For non-WebSocket requests, let Bun handle the routing
    // We must return a Response, not undefined
    return new Response(req.body);
  },

  websocket: setupWebSocketHandlers(),

  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;

      return Response.json({
        message: `Hello, ${name}!`,
        method: "GET",
      });
    },

    // Add an endpoint to get the current number of WebSocket connections
    "/api/connections": () => {
      return Response.json({
        connections: activeConnections.size,
      });
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
