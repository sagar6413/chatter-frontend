// src/hooks/useWebSocketConnection.ts--
import { useEffect } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";

export function useWebSocketConnection(token: string) {
  const connected = useWebSocketStore((state) => state.connected);
  const connectionError = useWebSocketStore((state) => state.connectionError);
  const connect = useWebSocketStore((state) => state.connect);
  const disconnect = useWebSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (token) {
      connect(token);
      return () => {
        disconnect();
      };
    }
  }, [token, connect, disconnect]);

  return { connected, error: connectionError };
}
