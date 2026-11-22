import { create } from "zustand";
import { getIstDate } from "../utils/format";

type PickedSlot = { gameId: number; date: string; startTime: string };

type BookingDraftState = {
  gameId: number | null;
  durationMinutes: number;
  date: string;
  startTime: string | null;
  setGame: (gameId: number) => void;
  setDuration: (durationMinutes: number) => void;
  setDate: (date: string) => void;
  setStartTime: (startTime: string) => void;
  pickSlot: (slot: PickedSlot) => void;
};

// * Changing game, duration or date clears the chosen time
export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  gameId: null,
  durationMinutes: 60,
  date: getIstDate(0),
  startTime: null,
  setGame: (gameId) => set({ gameId, startTime: null }),
  setDuration: (durationMinutes) => set({ durationMinutes, startTime: null }),
  setDate: (date) => set({ date, startTime: null }),
  setStartTime: (startTime) => set({ startTime }),
  pickSlot: ({ gameId, date, startTime }) => set({ gameId, date, startTime }),
}));
