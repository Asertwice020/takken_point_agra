import { useState } from "react";
import { Link } from "react-router";
import RescheduleModal from "../../components/modals/RescheduleModal";
import BookingCard from "../../components/ticket/BookingCard";
import { useGames } from "../../hooks/useGames";
import { useMyBookings } from "../../hooks/useMyBookings";
import { useVenue } from "../../hooks/useVenue";
import type { MyBooking } from "../../types/booking.types";
import { splitBookings } from "../../utils/bookings";

// ==========================================
// * MY TICKETS: upcoming bookings (with QR and reschedule) and history
// ==========================================
export default function MyTickets() {
  const { data: bookings, hasError, reload } = useMyBookings(true);
  const { data: games } = useGames();
  const { data: venue } = useVenue();
  const [selected, setSelected] = useState<MyBooking | null>(null);
  const [notice, setNotice] = useState("");

  const findGameId = (booking: MyBooking) => games?.find((game) => game.name === booking.game_name)?.id ?? null;
  const selectedGameId = selected ? findGameId(selected) : null;

  if (!bookings) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted">
        {hasError ? "We could not load your tickets. Please refresh." : <div className="mx-auto h-10 w-48 animate-pulse rounded-md bg-hover" />}
      </div>
    );
  }

  const { upcoming, history } = splitBookings(bookings);
  const renderCard = (booking: MyBooking) => (
    <BookingCard key={booking.id} booking={booking} canReschedule={booking.canReschedule && findGameId(booking) !== null && Boolean(venue)} onReschedule={setSelected} />
  );

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight">My tickets</h1>
        <Link to="/" className="text-sm text-muted transition-colors duration-150 hover:text-ink">← Back to home</Link>
      </div>

      {notice && <p className="rounded-lg border border-line bg-panel px-4 py-3 text-sm">{notice}</p>}

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-wide text-muted">Upcoming</h2>
        {upcoming.length ? upcoming.map(renderCard) : (
          <div className="rounded-xl border border-line bg-panel p-6 text-center text-sm text-muted">
            <p>No upcoming bookings.</p>
            <Link to="/" className="mt-3 inline-block underline underline-offset-4 hover:text-ink">Book a slot</Link>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-wide text-muted">History</h2>
          {history.map(renderCard)}
        </section>
      )}

      {selected && selectedGameId !== null && venue && (
        <RescheduleModal
          booking={selected}
          gameId={selectedGameId}
          bookingDaysAhead={venue.bookingDaysAhead}
          onClose={() => setSelected(null)}
          onDone={(message) => { setSelected(null); setNotice(message); reload(); }}
        />
      )}
    </div>
  );
}
