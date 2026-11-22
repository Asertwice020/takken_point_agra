export type Duration = { minutes: number; price: number };
export type Game = { id: number; name: string; stations: number; durations: Duration[] };
export type Slot = { startTime: string; seatsLeft: number; isBookable: boolean; reason: string | null };
export type SlotsResponse = { shopOpen: boolean; slots: Slot[] };
export type NextAvailable = { gameId: number; gameName: string; date: string; startTime: string };

export type BookingStatus = "PENDING_PAYMENT" | "AWAITING_CONFIRMATION" | "CONFIRMED" | "REJECTED" | "EXPIRED" | "USED";
export type BookingInput = { gameId: number; bookingDate: string; startTime: string; durationMinutes: number };
export type BookingState = {
  id: number; status: BookingStatus; gameName: string; bookingDate: string; startTime: string; durationMinutes: number;
  amount: number; holdExpiresAt: string | null; shopOpen: boolean; upiLink: string | null; ticketCode: string | null;
};

// * One row of "My tickets" (the server sends these fields as shown)
export type MyBooking = {
  id: number; status: BookingStatus; booking_date: string; start_time: string; duration_minutes: number;
  amount: number; reschedule_count: number; game_name: string; ticketCode: string | null; canReschedule: boolean;
};
