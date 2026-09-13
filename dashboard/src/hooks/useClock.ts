import { useState, useEffect } from 'react';

export function useClock(): string {
  const [timeStr, setTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeStr;
}
