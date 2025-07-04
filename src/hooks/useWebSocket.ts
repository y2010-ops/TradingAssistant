import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // In a real app, this would connect to your backend WebSocket server
      // For demo purposes, we'll simulate a connection
      setTimeout(() => {
        setConnected(true);
        setConnectionStatus('connected');
      }, 1000);
    };

    const disconnectWebSocket = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      setConnectionStatus('disconnected');
    };

    connectWebSocket();

    // Simulate connection drops and reconnections
    const intervalId = setInterval(() => {
      const shouldDisconnect = Math.random() < 0.1; // 10% chance of disconnect
      
      if (shouldDisconnect && connected) {
        disconnectWebSocket();
        setTimeout(connectWebSocket, 2000); // Reconnect after 2 seconds
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId);
      disconnectWebSocket();
    };
  }, [connected]);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    connected,
    connectionStatus,
    sendMessage
  };
};