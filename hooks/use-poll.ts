"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PollOptions<T> {
  /** Async function that fetches data. */
  fetcher:   () => Promise<T>;
  /** Polling interval in ms. Default: 30 000. */
  interval?: number;
  /** Fetch immediately on mount. Default: true. */
  immediate?: boolean;
  /** Only poll when the browser tab is visible. Default: true. */
  pauseWhenHidden?: boolean;
}

interface PollResult<T> {
  data:      T | null;
  error:     string | null;
  loading:   boolean;
  lastFetch: Date | null;
  /** Trigger an immediate manual refresh. */
  refresh:   () => void;
}

/**
 * usePoll — generic polling hook.
 *
 * Usage:
 *   const { data, loading, refresh } = usePoll({
 *     fetcher:  () => api.system(),
 *     interval: 10_000,
 *   });
 */
export function usePoll<T>({
  fetcher,
  interval       = 30_000,
  immediate      = true,
  pauseWhenHidden = true,
}: PollOptions<T>): PollResult<T> {
  const [data,      setData]      = useState<T | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(async () => {
    // Skip when tab is hidden to save battery / reduce CORS preflight noise
    if (pauseWhenHidden && document.visibilityState === "hidden") return;
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      setLastFetch(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher, pauseWhenHidden]);

  // Mount: optional immediate fetch + start interval
  useEffect(() => {
    if (immediate) run();
    timerRef.current = setInterval(run, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, immediate]);

  return { data, error, loading, lastFetch, refresh: run };
}
