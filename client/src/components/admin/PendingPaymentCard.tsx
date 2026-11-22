import { useState } from "react";
import type { OwnerBooking } from "../../types/owner.types";
import { formatClock, formatDateLabel, formatDuration, formatPrice, formatTime12h } from "../../utils/format";
import Countdown from "../booking/Countdown";
import Button from "../ui/Button";
import UtrCell from "./UtrCell";

type PendingPaymentCardProps = { booking: OwnerBooking; onConfirm: (booking: OwnerBooking) => Promise<void>; onReject: (booking: OwnerBooking) => void };

export default function PendingPaymentCard({ booking, onConfirm, onReject }: PendingPaymentCardProps) {
  const [isBusy, setIsBusy] = useState(false);
  const phoneDigits = (booking.customer_phone ?? "").replace(/\D/g, "");

  const confirm = async () => {
    setIsBusy(true);
    await onConfirm(booking);
    setIsBusy(false);
  };

  return (
    <article className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl">{booking.customer_name ?? "Customer"}</h3>
          <p className="mt-1 text-sm text-muted">
            {phoneDigits && <a className="underline underline-offset-2 hover:text-ink" href={`tel:${phoneDigits}`}>{booking.customer_phone}</a>}
            {phoneDigits && " · "}
            <span className="break-all">{booking.customer_email}</span>
          </p>
        </div>
        <p className="font-serif text-3xl">{formatPrice(booking.amount)}</p>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3"><dt className="text-muted">Slot</dt><dd className="text-right">{booking.game_name} · {formatDateLabel(booking.booking_date)}, {formatTime12h(booking.start_time)} · {formatDuration(booking.duration_minutes)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">Payment note</dt><dd className="font-mono">TP-{booking.ticket_code}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">UTR</dt><dd><UtrCell bookingId={booking.id} masked={booking.utrMasked} /></dd></div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Decide within</dt>
          <dd>{booking.hold_expires_at ? <><Countdown until={booking.hold_expires_at} /> <span className="text-muted">(until {formatClock(booking.hold_expires_at)})</span></> : <span className="text-muted">Timer paused (shop closed)</span>}</dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="primary" disabled={isBusy} onClick={() => void confirm()}>{isBusy ? "Please wait..." : "Confirm payment"}</Button>
        <Button disabled={isBusy} onClick={() => onReject(booking)}>Reject</Button>
      </div>
    </article>
  );
}
