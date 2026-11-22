import { getSlots } from "../api/slot.api";
import { useFetch } from "./useFetch";

const REFRESH_MS = 15000;

// * Seats left change as other customers book, so the grid refreshes itself every 15 seconds
export const useSlots = (gameId: number | null, date: string, duration: number) =>
  useFetch(() => getSlots({ gameId: gameId as number, date, duration }), [gameId, date, duration], gameId !== null, REFRESH_MS);
