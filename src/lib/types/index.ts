// Define shared types for the server and client
export type Message = {
  direction: "sent" | "received";
  content: string;
  timestamp: string;
};

export type WebSocketMessage = {
  type: string;
  data?: any;
  timestamp: string;
};
