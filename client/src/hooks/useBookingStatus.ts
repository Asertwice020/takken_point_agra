import { useCallback, useEffect, useRef, useState } from "react";
import { getBookingState } from "../api/booking.api";
import type { BookingState, BookingStatus } from "../types/booking.types";

const FINAL_STATUSES: BookingStatus[] = ["CONFIRMED", "REJECTED", "EXPIRED", "USED"];
const POLL_MS = 4000;

// * Polls every ~4 seconds until the status is final. Timer and stop flag live in refs, not in render state.
export const useBookingStatus = (bookingId: number) => {
  const [state, setState] = useState<BookingState | null>(null);
  const [hasError, setHasError] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const isStoppedRef = useRef(false);

  const load = useCallback(async () => {
    window.clearTimeout(timerRef.current);
    try {
      const next = await getBookingState(bookingId);
      setState(next);
      setHasError(false);
      if (!isStoppedRef.current && !FINAL_STATUSES.includes(next.status)) timerRef.current = window.setTimeout(load, POLL_MS);
    } catch {
      setHasError(true);
      if (!isStoppedRef.current) timerRef.current = window.setTimeout(load, POLL_MS * 2);
    }
  }, [bookingId]);

  useEffect(() => {
    isStoppedRef.current = false;
    void load();
    return () => {
      isStoppedRef.current = true;
      window.clearTimeout(timerRef.current);
    };
  }, [load]);

  return { state, hasError, reload: load };
};
