"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type WebSocketContextType = {
  data: any;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({ data: null, isConnected: false });

export const useWebSocketData = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let pollingTimer: NodeJS.Timeout;

    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsUrl = `ws://${host}:8000/ws`;
    const dashboardUrl = `http://${host}:8000/dashboard`;

    const loadInitialData = async () => {
      try {
        const response = await fetch(dashboardUrl);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.warn('HTTP dashboard fetch failed:', error);
      }
    };

    const pollHttpData = async () => {
      try {
        const response = await fetch(dashboardUrl);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.warn('HTTP polling failed:', error);
      } finally {
        pollingTimer = setTimeout(pollHttpData, 3000);
      }
    };

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to FastAPI WebSocket');
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.warn('WebSocket initial ping failed', error);
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
        } catch (e) {
          console.error('Error parsing WebSocket data', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from FastAPI WebSocket. Reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (ws) {
          ws.close();
        }
      };
    };

    loadInitialData();
    pollHttpData();
    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect on unmount
        ws.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ data, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
