import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { createBooking } from "../../api/booking.api";
import BookingSummary from "../../components/booking/BookingSummary";
import ContextStrip from "../../components/booking/ContextStrip";
import DateTabs from "../../components/booking/DateTabs";
import DurationToggle from "../../components/booking/DurationToggle";
import GameSelector from "../../components/booking/GameSelector";
import SlotGrid from "../../components/booking/SlotGrid";
import VenueInfo from "../../components/booking/VenueInfo";
import LoginModal from "../../components/modals/LoginModal";
import ProfileModal from "../../components/modals/ProfileModal";
import NextBookingCard from "../../components/ticket/NextBookingCard";
import { useGames } from "../../hooks/useGames";
import { useMyBookings } from "../../hooks/useMyBookings";
import { useNextAvailable } from "../../hooks/useNextAvailable";
import { useSlots } from "../../hooks/useSlots";
import { useVenue } from "../../hooks/useVenue";
import { useAuthStore } from "../../store/auth.store";
import { useBookingDraftStore } from "../../store/bookingDraft.store";
import { getNextBooking } from "../../utils/bookings";
import { getApiErrorCode, getErrorMessage } from "../../utils/errorMessages";
import { getIstDate } from "../../utils/format";

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}

// ==========================================
// * HOME = BOOKING PAGE (two matching panels: choices left, live summary right)
// ==========================================
export default function Home() {
  const navigate = useNavigate();
  const { data: venue, hasError: hasVenueError } = useVenue();
  const { data: games, hasError: hasGamesError } = useGames();
  const draft = useBookingDraftStore();
  const [step, setStep] = useState<"idle" | "login" | "profile">("idle");
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedGame = games?.find((game) => game.id === draft.gameId) ?? null;
  const { data: slotData, isLoading: isSlotsLoading, reload: reloadSlots } = useSlots(draft.gameId, draft.date, draft.durationMinutes);
  const { next, isLoading: isNextLoading } = useNextAvailable(games, draft.durationMinutes, venue?.bookingDaysAhead ?? null);
  const isLoggedIn = useAuthStore((state) => state.session !== null);
  const { data: myBookings } = useMyBookings(isLoggedIn);
  const nextBooking = myBookings ? getNextBooking(myBookings) : null;

  // * Start on the first game, and keep the chosen duration valid for that game
  useEffect(() => {
    if (!games?.length) return;
    if (draft.gameId === null) draft.setGame(games[0].id);
    if (selectedGame && !selectedGame.durations.some((option) => option.minutes === draft.durationMinutes)) {
      draft.setDuration(selectedGame.durations.find((option) => option.minutes === 60)?.minutes ?? selectedGame.durations[0].minutes);
    }
  }, [games, selectedGame, draft]);

  // * Continue to pay: log in first (if needed), then name and phone (if needed), then hold the seat
  const proceed = async () => {
    const { session, profile } = useAuthStore.getState();
    if (!session) return setStep("login");
    if (!profile) return setStep("profile");
    if (draft.gameId === null || !draft.startTime) return;

    setIsCreating(true);
    setNotice("");
    try {
      const booking = await createBooking({ gameId: draft.gameId, bookingDate: draft.date, startTime: draft.startTime, durationMinutes: draft.durationMinutes });
      navigate(`/booking/${booking.id}`);
    } catch (error) {
      setNotice(getErrorMessage(error));
      reloadSlots(); // show the real seats left right away
      if (["SLOT_FULL", "CUTOFF_PASSED", "SLOT_PAST"].includes(getApiErrorCode(error) ?? "")) draft.setDate(draft.date); // clears the chosen time
    } finally {
      setIsCreating(false);
    }
  };

  const finishStep = () => { setStep("idle"); void proceed(); };

  if (hasVenueError || hasGamesError) {
    return <p className="mx-auto max-w-5xl px-4 py-16 text-center text-muted">Could not load the booking page. Please check your connection and refresh.</p>;
  }
  if (!venue || !games) {
    return <div className="mx-auto max-w-5xl px-4 py-16"><div className="mx-auto h-10 w-64 animate-pulse rounded-md bg-hover" /></div>;
  }

  const dates = Array.from({ length: Math.min(venue.bookingDaysAhead, 6) + 1 }, (_, index) => getIstDate(index));
  const price = selectedGame?.durations.find((option) => option.minutes === draft.durationMinutes)?.price ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-12 lg:pb-16">
      {nextBooking && <NextBookingCard booking={nextBooking} />}
      <ContextStrip venue={venue} games={games} next={next} isNextLoading={isNextLoading} onPickNext={draft.pickSlot} />

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-7 rounded-xl border border-line bg-panel p-6">
          <Section label="Game"><GameSelector games={games} selectedId={draft.gameId} onSelect={draft.setGame} /></Section>
          {selectedGame && <Section label="Duration"><DurationToggle options={selectedGame.durations} selected={draft.durationMinutes} onSelect={draft.setDuration} /></Section>}
          <Section label="Day"><DateTabs dates={dates} selected={draft.date} onSelect={draft.setDate} /></Section>
          <Section label="Time"><SlotGrid slots={slotData?.slots ?? []} selectedTime={draft.startTime} isLoading={isSlotsLoading} onSelect={draft.setStartTime} /></Section>
        </section>

        <BookingSummary
          gameName={selectedGame?.name ?? null}
          date={draft.date}
          startTime={draft.startTime}
          durationMinutes={draft.durationMinutes}
          price={price}
          notice={notice}
          isBusy={isCreating}
          onContinue={() => void proceed()}
        />
      </div>

      <VenueInfo venue={venue} />

      <LoginModal isOpen={step === "login"} onClose={() => setStep("idle")} onSuccess={finishStep} />
      <ProfileModal isOpen={step === "profile"} onClose={() => setStep("idle")} onSuccess={finishStep} />
    </div>
  );
}
