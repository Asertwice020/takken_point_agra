import { useCallback, useEffect, useRef, useState } from "react";
import { getOwnerBookings } from "../api/owner.api";
import type { OwnerBooking } from "../types/owner.types";
import { playAlertSound } from "../utils/alertSound";

const POLL_MS = 10000;
const BASE_TITLE = "Taken Point Agra | Book your slot";

// * Polls the payments waiting for confirmation. A new one plays the alert sound (if turned on) and shows a count in the tab title.
// * Known ids and the sound flag live in refs, so polling never causes extra renders.
export const usePendingPayments = (isSoundOn: boolean) => {
  const [pending, setPending] = useState<OwnerBooking[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const knownIdsRef = useRef<Set<number> | null>(null); // null until the first load, so existing payments do not beep
  const isSoundOnRef = useRef(isSoundOn);

  useEffect(() => { isSoundOnRef.current = isSoundOn; }, [isSoundOn]);

  const load = useCallback(async () => {
    try {
      const list = await getOwnerBookings({ status: "AWAITING_CONFIRMATION" });
      const known = knownIdsRef.current;
      if (known && isSoundOnRef.current && list.some((booking) => !known.has(Number(booking.id)))) playAlertSound();
      knownIdsRef.current = new Set(list.map((booking) => Number(booking.id)));
      setPending(list);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => { document.title = pending?.length ? `(${pending.length}) Payments waiting` : BASE_TITLE; }, [pending]);
  useEffect(() => () => { document.title = BASE_TITLE; }, []);

  return { pending, hasError, reload: load };
};
