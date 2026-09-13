import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, durationMs: number = 2800) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMessage(msg);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, durationMs);
  }, []);

  return { message, visible, showToast };
}
