import * as React from "react";

import { Eraser } from "lucide-react";

import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";

import { cn } from "@/lib/utils";
import { useWebSocket } from "@/lib/hooks/useWebSocket";

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
  } = useWebSocket({ autoConnect: true });

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
        <h2 className="inline-flex items-center gap-2 text-xl font-bold">
          WebSocket Tester
        </h2>

        <div className="ml-auto flex items-center gap-2">
          {!isConnected ? (
            <Button onClick={connect} variant="secondary">
              Connect
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive">
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "w-full h-[300px] bg-card overflow-y-auto",
          "border border-input rounded-xl p-3",
          "font-mono text-sm relative"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={clearMessages}
          className="sticky top-0 z-10 mb-4"
          disabled={messages.length === 0}
        >
          <Eraser className="h-4 w-4" />
        </Button>

        {messages.length === 0 ? (
          <div className="text-muted-foreground text-xs italic text-center h-auto flex items-center justify-center">
            No messages yet.
            <br />
            {isConnected
              ? "Send a message !"
              : "Connect to the WebSocket server to send messages."}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;

            if (msg.type === "connected" || msg.type === "disconnected") {
              return (
                <div
                  key={index}
                  ref={isLastMessage ? messagesEndRef : null}
                  className="not-last:mb-4 italic text-xs text-center text-muted-foreground"
                >
                  {msg.content}
                </div>
              );
            }

            return (
              <div
                key={index}
                ref={isLastMessage ? messagesEndRef : null}
                className={cn(
                  "not-last:mb-4 p-2 rounded-lg max-w-[80%]",
                  msg.direction === "sent"
                    ? "bg-secondary text-secondary-foreground ml-auto"
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
            );
          })
        )}
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
