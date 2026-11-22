import { useEffect, useRef, useState } from "react";
import { getSlots } from "../api/slot.api";
import type { Game, NextAvailable } from "../types/booking.types";
import { getIstDate } from "../utils/format";

const REFRESH_MS = 30000;

// * Earliest upcoming slot that still has a seat left, across all games and bookable days. Refreshes quietly every 30 seconds.
export const useNextAvailable = (games: Game[] | null, duration: number, daysAhead: number | null) => {
  const [next, setNext] = useState<NextAvailable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") setTick((value) => value + 1); }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!games || daysAhead === null) return;
    let isCancelled = false;
    if (isFirstLoadRef.current) setIsLoading(true);
    const dates = Array.from({ length: Math.min(daysAhead, 6) + 1 }, (_, index) => getIstDate(index));
    const offeredGames = games.filter((game) => game.durations.some((option) => option.minutes === duration));

    Promise.all(
      dates.flatMap((date) =>
        offeredGames.map(async (game): Promise<NextAvailable | null> => {
          const { slots } = await getSlots({ gameId: game.id, date, duration });
          const slot = slots.find((item) => item.isBookable);
          return slot ? { gameId: game.id, gameName: game.name, date, startTime: slot.startTime } : null;
        }),
      ),
    )
      .then((results) => {
        const found = results.filter((item): item is NextAvailable => item !== null);
        found.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`) || a.gameId - b.gameId);
        if (!isCancelled) setNext(found[0] ?? null);
      })
      .catch(() => { if (!isCancelled && isFirstLoadRef.current) setNext(null); })
      .finally(() => {
        isFirstLoadRef.current = false;
        if (!isCancelled) setIsLoading(false);
      });
    return () => { isCancelled = true; };
  }, [games, duration, daysAhead, tick]);

  return { next, isLoading };
};
