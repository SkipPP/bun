import { APITester } from "@/components/APITester";
import { WebSocketTester } from "@/components/WebSocketTester";

import "@/lib/styles/globals.css";

export default function Home() {
  return (
    <div className="container py-10 m-auto">
      <h1 className="text-2xl font-bold text-center">trying bun</h1>

      <div className="flex flex-row gap-20">
        <APITester />

        <WebSocketTester />
      </div>
    </div>
  );
}
