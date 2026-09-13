import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage } from '../types/dashboard';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
}

export function useWebSocket({ onMessage, reconnectInterval = 5000 }: UseWebSocketOptions = {}) {
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [channelStatusText, setChannelStatusText] = useState<string>('Connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/live`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsStatus('connected');
        setChannelStatusText('Live channel ready');
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketMessage;
          if (onMessageRef.current) {
            onMessageRef.current(parsed);
          }
        } catch {
          if (onMessageRef.current) {
            onMessageRef.current({ type: 'telemetry', data: {} as any });
          }
        }
      };

      socket.onclose = () => {
        setWsStatus('disconnected');
        setChannelStatusText('Live channel offline');
        wsRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
      };

      socket.onerror = () => {
        setWsStatus('disconnected');
        setChannelStatusText('Live channel offline');
        socket.close();
      };
    } catch {
      setWsStatus('disconnected');
      setChannelStatusText('Live channel offline');
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
    }
  }, [reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { wsStatus, channelStatusText, reconnect: connect };
}
