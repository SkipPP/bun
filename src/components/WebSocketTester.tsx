import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";

export function WebSocketTester() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = React.useState("");

  const {
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useWebSocket();

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMessage.trim() && sendMessage(inputMessage)) {
      setInputMessage("");
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-2xl text-left flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">WebSocket Tester</h2>

        <div className="ml-auto flex items-center gap-2">
          {!isConnected ? (
            <Button onClick={connect} variant="default">
              Connect
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive">
              Disconnect
            </Button>
          )}

          <Button onClick={clearMessages} variant="outline">
            Clear
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "w-full h-[300px] bg-card overflow-y-auto",
          "border border-input rounded-xl p-3",
          "font-mono text-sm"
        )}
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground text-center h-full flex items-center justify-center">
            No messages yet.
            <br />
            Connect to the WebSocket server and send a message.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "mb-2 p-2 rounded-lg max-w-[80%]",
                msg.direction === "sent"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              )}
            >
              <pre className="whitespace-pre-wrap break-words">
                {msg.content}
              </pre>

              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            isConnected ? "Type a message..." : "Connect to send messages..."
          }
          disabled={!isConnected}
          className="flex-1 font-mono"
        />

        <Button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          variant="secondary"
        >
          Send
        </Button>
      </form>

      <div className="text-xs text-muted-foreground">
        <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>

        <p className="mt-1">
          Tip: You can send plain text or JSON objects. JSON will be
          automatically formatted.
        </p>
      </div>
    </div>
  );
}
