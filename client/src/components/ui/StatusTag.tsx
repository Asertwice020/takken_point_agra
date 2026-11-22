import type { BookingStatus } from "../../types/booking.types";
import { STATUS_LABEL } from "../../utils/bookings";

const TONES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-emerald-400/10 text-emerald-300",
  AWAITING_CONFIRMATION: "bg-amber-400/10 text-amber-300",
  PENDING_PAYMENT: "bg-amber-400/10 text-amber-300",
  REJECTED: "bg-red-400/10 text-red-300",
  EXPIRED: "bg-white/5 text-muted",
  USED: "bg-white/5 text-muted",
};

// * Status tags are the only soft colors in the interface, so a status reads at a glance
export default function StatusTag({ status }: { status: BookingStatus }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${TONES[status]}`}>{STATUS_LABEL[status]}</span>;
}
