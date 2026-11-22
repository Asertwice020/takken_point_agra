import type { SlotsResponse } from "../types/booking.types";
import { api } from "./axios";

type SlotQuery = { gameId: number; date: string; duration: number };

export const getSlots = async ({ gameId, date, duration }: SlotQuery): Promise<SlotsResponse> =>
  (await api.get("/api/slots", { params: { gameId, date, duration } })).data.data;
