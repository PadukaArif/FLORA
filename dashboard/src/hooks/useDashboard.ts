import { useState, useEffect, useCallback } from 'react';
import { DashboardState } from '../types/dashboard';
import { getDashboardState, createWateringEvent } from '../services/api';
import { useWebSocket } from './useWebSocket';

interface UseDashboardReturn {
  data: DashboardState | null;
  loading: boolean;
  error: string | null;
  systemState: string;
  refresh: () => Promise<void>;
  recordWatering: (note?: string) => Promise<void>;
}

export function useDashboard(onToast?: (msg: string) => void): UseDashboardReturn {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const state = await getDashboardState();
      setData(state);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Backend tidak dapat dihubungi');
      if (onToast) {
        onToast('Backend tidak dapat dihubungi');
      }
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  const handleWebSocketMessage = useCallback(() => {
    loadData();
  }, [loadData]);

  const { channelStatusText } = useWebSocket({
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
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    systemState: getSystemState(),
    refresh: loadData,
    recordWatering,
  };
}
