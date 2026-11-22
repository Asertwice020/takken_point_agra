import type { Game } from "../types/booking.types";
import { api } from "./axios";

export const getGames = async (): Promise<Game[]> => (await api.get("/api/games")).data.data.games;
