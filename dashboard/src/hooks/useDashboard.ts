import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardState, WebSocketMessage } from '../types/dashboard';
import { getDashboardState, createWateringEvent } from '../services/api';
import { useWebSocket } from './useWebSocket';
import { evaluateSystemAlert } from '../utils/sensorRules';

interface UseDashboardReturn {
  data: DashboardState | null;
  loading: boolean;
  error: string | null;
  systemState: string;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  refresh: () => Promise<void>;
  recordWatering: (note?: string) => Promise<void>;
}

export function useDashboard(onToast?: (msg: string) => void): UseDashboardReturn {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const prevSeverityRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const state = await getDashboardState();
      setData(state);
      setError(null);
      if (state.latest) {
        const currentAlert = evaluateSystemAlert(state.latest, state.mqtt);
        prevSeverityRef.current = currentAlert.severity;
      }
    } catch (err: any) {
      setError(err?.message || 'Backend tidak dapat dihubungi');
      if (onToast) {
        onToast('Backend tidak dapat dihubungi');
      }
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  const handleWebSocketMessage = useCallback(
    (msg: WebSocketMessage) => {
      if (!msg) return;

      if (msg.type === 'telemetry' && msg.data && msg.data.timestamp) {
        setData((prev) => {
          if (!prev) return prev;

          // Check for condition / severity change
          const newAlert = evaluateSystemAlert(msg.data, prev.mqtt);
          if (
            prevSeverityRef.current &&
            prevSeverityRef.current !== newAlert.severity &&
            newAlert.severity !== 'AWAITING'
          ) {
            if (onToast) {
              onToast(`Kondisi berubah: ${newAlert.title}`);
            }
          }
          prevSeverityRef.current = newAlert.severity;

          return {
            ...prev,
            latest: msg.data,
            history: [...prev.history.slice(-287), msg.data],
            lastTelemetryAt: msg.data.timestamp,
          };
        });
      } else if (msg.type === 'mqtt' && msg.data) {
        setData((prev) => (prev ? { ...prev, mqtt: msg.data } : prev));
      } else if (msg.type === 'watering') {
        loadData();
      }
    },
    [loadData, onToast]
  );

  const { wsStatus, channelStatusText } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  const getSystemState = (): string => {
    if (!data || !data.latest) return channelStatusText || 'Connecting';
    const timestamp = Date.parse(data.latest.timestamp);
    if (isNaN(timestamp)) return 'Telemetry stale';
    const isOnline = Date.now() - timestamp < 20000;
    return isOnline ? 'Monitoring active' : 'Telemetry stale';
  };

  const recordWatering = useCallback(
    async (note: string = 'Recorded from dashboard') => {
      try {
        await createWateringEvent(note);
        if (onToast) {
          onToast('Watering event recorded');
        }
        await loadData();
      } catch (err: any) {
        if (onToast) {
          onToast('Gagal mencatat penyiraman');
        }
      }
    },
    [loadData, onToast]
  );

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    systemState: getSystemState(),
    wsStatus,
    refresh: loadData,
    recordWatering,
  };
}
