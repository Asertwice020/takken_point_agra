import { useState } from "react";
import { Link } from "react-router";
import type { MyBooking } from "../../types/booking.types";
import { formatDateLabel, formatDuration, formatPrice, formatTime12h } from "../../utils/format";
import Button from "../ui/Button";
import StatusTag from "../ui/StatusTag";
import TicketCard from "./TicketCard";

const ACTION_STYLE = "inline-flex rounded-md border border-line px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-hover";

type BookingCardProps = { booking: MyBooking; canReschedule: boolean; onReschedule: (booking: MyBooking) => void };

export default function BookingCard({ booking, canReschedule, onReschedule }: BookingCardProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const hasTicket = booking.status === "CONFIRMED" && Boolean(booking.ticketCode);

  return (
    <article className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl">{booking.game_name}</h3>
          <p className="mt-1 text-sm text-muted">
            {formatDateLabel(booking.booking_date)}, {formatTime12h(booking.start_time)} · {formatDuration(booking.duration_minutes)} · {formatPrice(booking.amount)}
          </p>
        </div>
        <StatusTag status={booking.status} />
      </div>
      {booking.reschedule_count > 0 && <p className="mt-2 text-xs text-muted">Rescheduled</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {booking.status === "PENDING_PAYMENT" && <Link className={ACTION_STYLE} to={`/booking/${booking.id}`}>Pay now</Link>}
        {booking.status === "AWAITING_CONFIRMATION" && <Link className={ACTION_STYLE} to={`/booking/${booking.id}`}>Track status</Link>}
        {hasTicket && <Button onClick={() => setIsQrOpen((isOpen) => !isOpen)}>{isQrOpen ? "Hide QR" : "Show QR"}</Button>}
        {canReschedule && <Button onClick={() => onReschedule(booking)}>Reschedule</Button>}
      </div>

      {isQrOpen && booking.ticketCode && (
        <div className="mt-5 border-t border-line pt-5">
          <TicketCard gameName={booking.game_name} date={booking.booking_date} startTime={booking.start_time} durationMinutes={booking.duration_minutes} ticketCode={booking.ticketCode} />
        </div>
      )}
    </article>
  );
}
