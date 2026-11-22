import type { Game, NextAvailable } from "../../types/booking.types";
import type { Venue } from "../../types/venue.types";
import { formatDuration, formatPrice } from "../../utils/format";
import NextAvailableButton from "./NextAvailableButton";
import VenueStatusPill from "./VenueStatusPill";

type ContextStripProps = {
  venue: Venue;
  games: Game[];
  next: NextAvailable | null;
  isNextLoading: boolean;
  onPickNext: (next: NextAvailable) => void;
};

export default function ContextStrip({ venue, games, next, isNextLoading, onPickNext }: ContextStripProps) {
  return (
    <section className="flex flex-col items-center gap-5 text-center">
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Book your slot</h1>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <VenueStatusPill venue={venue} />
        {(games[0]?.durations ?? []).map((option) => (
          <span key={option.minutes} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            {formatPrice(option.price)} · {formatDuration(option.minutes)}
          </span>
        ))}
      </div>
      <NextAvailableButton next={next} isLoading={isNextLoading} onPick={onPickNext} />
      {!venue.shopOpen && (
        <p className="max-w-xl rounded-lg border border-line bg-panel px-4 py-3 text-sm text-muted">
          Shop is closed. Your booking will be confirmed when we open.
        </p>
      )}
    </section>
  );
}
