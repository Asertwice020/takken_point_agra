import { useEffect, useState } from "react";
import { getServerNow } from "../../utils/serverClock";

const secondsUntil = (until: string) => Math.max(0, Math.floor((new Date(until).getTime() - getServerNow()) / 1000));

// * Reads like "11 min 43 s". Only this tiny component re-renders every second.
export default function Countdown({ until }: { until: string }) {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(until));

  useEffect(() => {
    setSecondsLeft(secondsUntil(until));
    const timer = window.setInterval(() => setSecondsLeft(secondsUntil(until)), 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  if (secondsLeft === 0) return <span>Time is up</span>;
  const minutes = Math.floor(secondsLeft / 60);
  return <span>{minutes > 0 ? `${minutes} min ${secondsLeft % 60} s` : `${secondsLeft} s`}</span>;
}
