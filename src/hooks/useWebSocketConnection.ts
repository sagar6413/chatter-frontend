// src/hooks/useWebSocketConnection.ts
import { useEffect } from 'react';
import useWebSocketStore from '@/store/webSocketStore';

export const useWebSocketConnection = (token: string) => {
  const { connect, disconnect, connected, connectionError } = useWebSocketStore();

  useEffect(() => {
    if (token) {
      connect(token);
      
      return () => {
        disconnect();
      };
    }
  }, [token, connect, disconnect]);

  return { connected, connectionError };
};