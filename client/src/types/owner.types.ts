import type { BookingStatus } from "./booking.types";

// * One row from the owner's booking list (the UTR is always masked here)
export type OwnerBooking = {
  id: number; booking_date: string; start_time: string; duration_minutes: number; amount: number; status: BookingStatus;
  ticket_code: string; hold_expires_at: string | null; created_at: string; game_name: string;
  customer_name: string | null; customer_phone: string | null; customer_email: string; utrMasked: string | null; hasUtr: boolean;
};
