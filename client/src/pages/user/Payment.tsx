import { Link, useParams } from "react-router";
import BookingStateCard from "../../components/booking/BookingStateCard";
import PayNow from "../../components/booking/PayNow";
import TicketCard from "../../components/ticket/TicketCard";
import { useBookingStatus } from "../../hooks/useBookingStatus";
import { formatDateLabel, formatDuration, formatTime12h } from "../../utils/format";

const whatsappNumber = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "").replace(/\D/g, "");
const LINK_STYLE = "inline-flex rounded-md border border-line px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-hover";

// ==========================================
// * PAYMENT PAGE: pay, wait for the owner, then see the ticket (status polls automatically)
// ==========================================
export default function Payment() {
  const { id } = useParams();
  const { state, hasError, reload } = useBookingStatus(Number(id));

  if (!state) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted">
        {hasError ? (
          <div className="space-y-4">
            <p>We could not load this booking.</p>
            <Link className={LINK_STYLE} to="/">Back to home</Link>
          </div>
        ) : (
          <div className="mx-auto h-10 w-48 animate-pulse rounded-md bg-hover" />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link to="/" className="mb-4 inline-block text-sm text-muted transition-colors duration-150 hover:text-ink">← Back to home</Link>
      <div className="rounded-xl border border-line bg-panel p-6">
        <div className="mb-6 border-b border-line pb-5 text-center">
          <h1 className="font-serif text-2xl">{state.gameName}</h1>
          <p className="mt-1 text-sm text-muted">{formatDateLabel(state.bookingDate)}, {formatTime12h(state.startTime)} · {formatDuration(state.durationMinutes)}</p>
        </div>

        {state.status === "PENDING_PAYMENT" && <PayNow booking={state} onPaid={() => void reload()} />}

        {state.status === "AWAITING_CONFIRMATION" && (
          <BookingStateCard
            isWaiting
            title="Waiting for confirmation"
            text={state.shopOpen
              ? "We are checking your payment. This page updates by itself, and your ticket will also be emailed to you."
              : "The shop is closed right now. We will confirm your booking as soon as we open, and email your ticket."}
          >
            <Link className={LINK_STYLE} to="/">Back to home</Link>
          </BookingStateCard>
        )}

        {(state.status === "CONFIRMED" || state.status === "USED") && state.ticketCode && (
          <div className="space-y-5">
            <p className="text-center font-serif text-2xl">{state.status === "USED" ? "Ticket used" : "Booking confirmed"}</p>
            <TicketCard gameName={state.gameName} date={state.bookingDate} startTime={state.startTime} durationMinutes={state.durationMinutes} ticketCode={state.ticketCode} />
            <p className="text-center text-xs text-muted">Show this QR at the counter. Late arrivals lose that time.</p>
            <div className="text-center"><Link className={LINK_STYLE} to="/">Back to home</Link></div>
          </div>
        )}

        {state.status === "REJECTED" && (
          <BookingStateCard title="Payment not verified" text="We could not match your payment. If you have paid, message us with your UTR number and we will sort it out.">
            <div className="flex flex-wrap justify-center gap-2">
              {whatsappNumber && <a className={LINK_STYLE} href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp us</a>}
              <Link className={LINK_STYLE} to="/">Back to home</Link>
            </div>
          </BookingStateCard>
        )}

        {state.status === "EXPIRED" && (
          <BookingStateCard title="This booking expired" text="Your seat was released. If you already paid, message us with your UTR number.">
            <Link className={LINK_STYLE} to="/">Book again</Link>
          </BookingStateCard>
        )}
      </div>
    </div>
  );
}
