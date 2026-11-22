import type { BookingStatus, MyBooking } from "../types/booking.types";
import { getServerNow } from "./serverClock";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  AWAITING_CONFIRMATION: "Waiting for owner",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  USED: "Used",
};

const LIVE_STATUSES: BookingStatus[] = ["PENDING_PAYMENT", "AWAITING_CONFIRMATION", "CONFIRMED"];

const getSlotEnd = (booking: MyBooking) =>
  new Date(`${booking.booking_date}T${booking.start_time.slice(0, 5)}:00+05:30`).getTime() + booking.duration_minutes * 60000;

const isUpcoming = (booking: MyBooking) => LIVE_STATUSES.includes(booking.status) && getSlotEnd(booking) > getServerNow();
const byStart = (a: MyBooking, b: MyBooking) => `${a.booking_date} ${a.start_time}`.localeCompare(`${b.booking_date} ${b.start_time}`);

// * Upcoming = still active and not over yet (soonest first). Everything else is history.
export const splitBookings = (bookings: MyBooking[]) => ({
  upcoming: bookings.filter(isUpcoming).sort(byStart),
  history: bookings.filter((booking) => !isUpcoming(booking)),
});

export const getNextBooking = (bookings: MyBooking[]): MyBooking | null =>
  splitBookings(bookings).upcoming.find((booking) => booking.status === "CONFIRMED") ?? null;
