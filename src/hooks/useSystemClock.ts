import { useState, useEffect } from 'react';

export interface SystemClockState {
  istTime: string; // e.g. "01:27:42 IST"
  istDate: string; // e.g. "08 Sep 2026"
  timestamp: number;
}

const istTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

const istDateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

/**
 * Independent Real-World System Clock Hook.
 * Displays live Indian Standard Time (IST) running strictly once per second.
 * Completely independent of simulation speed, pauses, or replay states.
 */
export function useSystemClock(): SystemClockState {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return {
    istTime: `${istTimeFormatter.format(now)} IST`,
    istDate: istDateFormatter.format(now),
    timestamp: now.getTime()
  };
}
