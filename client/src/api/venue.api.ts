import type { Venue } from "../types/venue.types";
import { api } from "./axios";

export const getVenue = async (): Promise<Venue> => (await api.get("/api/venue")).data.data.venue;
