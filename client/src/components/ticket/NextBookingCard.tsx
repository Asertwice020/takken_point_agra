import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router";
import type { MyBooking } from "../../types/booking.types";
import { formatDateLabel, formatDuration, formatTime12h } from "../../utils/format";

// * Top of Home for returning customers: the next confirmed booking with its QR
export default function NextBookingCard({ booking }: { booking: MyBooking }) {
  return (
    <section className="mx-auto mb-10 flex max-w-xl items-center justify-between gap-5 rounded-xl border border-line bg-panel p-5">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">Your next booking</p>
        <p className="mt-1 font-serif text-xl">{booking.game_name}</p>
        <p className="text-sm text-muted">{formatDateLabel(booking.booking_date)}, {formatTime12h(booking.start_time)} · {formatDuration(booking.duration_minutes)}</p>
        <Link to="/tickets" className="mt-3 inline-block text-sm underline underline-offset-4 transition-colors duration-150 hover:text-white">All my tickets</Link>
      </div>
      {booking.ticketCode && (
        <div className="shrink-0 rounded-lg bg-white p-2">
          <QRCodeSVG value={booking.ticketCode} size={96} bgColor="#ffffff" fgColor="#191919" />
        </div>
      )}
    </section>
  );
}
