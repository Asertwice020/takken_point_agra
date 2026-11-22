import type { BookingStatus } from "../types/booking.types";
import type { OwnerBooking } from "../types/owner.types";
import { api } from "./axios";

export const getOwnerBookings = async (params: { date?: string; status?: BookingStatus }): Promise<OwnerBooking[]> =>
  (await api.get("/api/owner/bookings", { params })).data.data.bookings;

export const revealUtr = async (id: number): Promise<string> => (await api.get(`/api/owner/bookings/${id}/utr`)).data.data.utr;

export const confirmBooking = async (id: number): Promise<void> => {
  await api.post(`/api/owner/bookings/${id}/confirm`);
};

export const rejectBooking = async (id: number): Promise<void> => {
  await api.post(`/api/owner/bookings/${id}/reject`);
};

export const setShopStatus = async (isOpen: boolean): Promise<{ shopOpen: boolean; waitingCount: number }> =>
  (await api.put("/api/owner/shop", { isOpen })).data.data;

export const loginOwner = async (email: string, password: string): Promise<{ token: string; email: string; expiresAt: number }> =>
  (await api.post("/api/owner/login", { email, password })).data.data;
