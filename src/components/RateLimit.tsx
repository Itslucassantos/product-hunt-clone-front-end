"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RateLimitContextValue = { secondsLeft: number; start: (seconds: number) => void };

const RateLimitContext = createContext<RateLimitContextValue | null>(null);

export function RateLimitProvider({ children }: { children: ReactNode }) {
  const [until, setUntil] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback((seconds: number) => {
    const target = Date.now() + seconds * 1000;
    setUntil((current) => Math.max(current, target));
  }, []);

  useEffect(() => {
    if (until === 0) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) setUntil(0);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [until]);

  const value = useMemo(() => ({ secondsLeft, start }), [secondsLeft, start]);

  return <RateLimitContext.Provider value={value}>{children}</RateLimitContext.Provider>;
}

export function useRateLimit() {
  const context = useContext(RateLimitContext);
  if (!context) throw new Error("useRateLimit must be used inside <RateLimitProvider>");
  return {
    limited: context.secondsLeft > 0,
    secondsLeft: context.secondsLeft,
    start: context.start,
  };
}
