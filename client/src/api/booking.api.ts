import type { BookingInput, BookingState, BookingStatus, MyBooking } from "../types/booking.types";
import { api } from "./axios";

export const createBooking = async (input: BookingInput): Promise<{ id: number; status: BookingStatus }> =>
  (await api.post("/api/bookings", input)).data.data.booking;

export const getBookingState = async (id: number): Promise<BookingState> => (await api.get(`/api/bookings/${id}/status`)).data.data;

export const markBookingPaid = async (id: number, utr: string): Promise<void> => {
  await api.post(`/api/bookings/${id}/paid`, { utr });
};

export const getMyBookings = async (): Promise<MyBooking[]> => (await api.get("/api/bookings/mine")).data.data.bookings;

export const rescheduleBooking = async (id: number, input: { bookingDate: string; startTime: string }): Promise<void> => {
  await api.post(`/api/bookings/${id}/reschedule`, input);
};
