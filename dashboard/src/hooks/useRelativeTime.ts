import { useState, useEffect } from 'react';

export function useRelativeTime(timestamp: string | null | undefined): {
  relativeText: string;
  isStale: boolean;
  secondsAgo: number;
} {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timestamp) {
    return { relativeText: 'No telemetry', isStale: true, secondsAgo: Infinity };
  }

  const parsed = Date.parse(timestamp);
  if (isNaN(parsed)) {
    return { relativeText: 'Invalid time', isStale: true, secondsAgo: Infinity };
  }

  const diffSec = Math.max(0, Math.floor((now - parsed) / 1000));
  const isStale = diffSec > 25;

  let relativeText = 'Just now';
  if (diffSec < 5) {
    relativeText = 'Live (< 5s)';
  } else if (diffSec < 60) {
    relativeText = `${diffSec}s ago`;
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    relativeText = `${mins}m ago`;
  } else {
    const hours = Math.floor(diffSec / 3600);
    relativeText = `${hours}h ago`;
  }

  return { relativeText, isStale, secondsAgo: diffSec };
}
