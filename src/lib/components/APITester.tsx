import * as React from "react";

import { Input } from "@/lib/components/ui/input";
import { Select } from "@/lib/components/ui/select";
import { Button } from "@/lib/components/ui/button";

import { cn } from "@/lib/utils";

export function APITester() {
  const responseInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = React.useState("/api/hello");

  const testEndpoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const method = formData.get("method") as string;
      const endpoint = formData.get("endpoint") as string;

      const url = new URL(endpoint, location.href);
      const res = await fetch(url, { method });

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  };

  return (
    <form
      onSubmit={testEndpoint}
      className="mt-8 mx-auto w-full max-w-2xl text-left flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">API Tester</h2>

        <div className="ml-auto flex items-center gap-2">
          <Select name="method" defaultValue="GET" variant="secondary">
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
          </Select>
        </div>
      </div>

      <textarea
        ref={responseInputRef}
        readOnly
        disabled
        placeholder="Response will appear here..."
        className={cn(
          "w-full min-h-[300px] bg-card overflow-y-auto disabled:cursor-not-allowed",
          "border border-input rounded-xl p-3",
          "font-mono text-sm text-muted-foreground"
        )}
      />

      <div className="flex items-center gap-2">
        <Input
          type="text"
          name="endpoint"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="/api/hello"
          className="bg-card"
        />

        <Button type="submit" variant="secondary" disabled={!inputValue.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
