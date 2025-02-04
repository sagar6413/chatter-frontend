//--./src/hooks/useWebSocket.ts--
import { useEffect } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { getAccessToken } from "@/util/tokenManagerUtil";

export const useWebSocket = () => {
  const token = getAccessToken();
  const { connect, disconnect, connected, connectionError } =
    useWebSocketStore();

  useEffect(() => {
    if (token && !connected) {
      connect(token);
    }

    return () => {
      disconnect();
    };
  }, [token]);

  return {
    connected,
    connectionError,
  };
};
