import { useState, useEffect, useRef, useCallback } from "react";

import type { Message } from "@/lib/types";

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const { onOpen, onMessage, onClose, onError, autoConnect = false } = options;

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = (event) => {
      setIsConnected(true);

      addMessage({
        direction: "received",
        content: "Connected to WebSocket server",
        timestamp: new Date().toISOString(),
        type: "connected",
      });

      if (onOpen) onOpen(event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        addMessage({
          direction: "received",
          content: JSON.stringify(data, null, 2),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        addMessage({
          direction: "received",
          content: event.data,
          timestamp: new Date().toISOString(),
        });
      }

      if (onMessage) onMessage(event);
    };

    ws.onclose = (event) => {
      setIsConnected(false);

      addMessage({
        direction: "received",
        content: "Disconnected from WebSocket server",
        timestamp: new Date().toISOString(),
        type: "disconnected",
      });

      if (onClose) onClose(event);
    };

    ws.onerror = (event) => {
      addMessage({
        direction: "received",
        content: `WebSocket error occurred`,
        timestamp: new Date().toISOString(),
      });

      if (onError) onError(event);
    };

    wsRef.current = ws;
  }, [onOpen, onMessage, onClose, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((messageText: string) => {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !messageText.trim()
    ) {
      return false;
    }

    try {
      // Try to parse as JSON if it looks like JSON
      let messageToSend = messageText.trim();

      if (
        (messageToSend.startsWith("{") && messageToSend.endsWith("}")) ||
        (messageToSend.startsWith("[") && messageToSend.endsWith("]"))
      ) {
        // Validate JSON by parsing and re-stringifying
        messageToSend = JSON.stringify(JSON.parse(messageToSend));
      }

      wsRef.current.send(messageToSend);

      addMessage({
        direction: "sent",
        content: messageToSend,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      addMessage({
        direction: "received",
        content: `Error sending message: ${error}`,
        timestamp: new Date().toISOString(),
      });

      return false;
    }
  }, []);

  // Add message to history
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
}

// Simplified hook for just sending messages
export function useWebSocketSender() {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    wsRef.current = ws;
    return ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const messageStr =
        typeof message === "string" ? message : JSON.stringify(message);

      wsRef.current.send(messageStr);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, connect, disconnect, sendMessage };
}

// Hook for listening to specific message types
export function useWebSocketListener<T = any>(
  messageType: string,
  callback: (data: T) => void,
  options: { autoConnect?: boolean } = {}
) {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const { autoConnect = true } = options;

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === messageType) {
          callback(data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => setIsConnected(false);

    wsRef.current = ws;

    return ws;
  }, [messageType, callback]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, connect]);

  return { isConnected, connect, disconnect };
}
