import type { Venue } from "../../types/venue.types";
import { formatTime12h } from "../../utils/format";

// * Read-only label for customers. The ON/OFF switch exists only on the owner dashboard.
export default function VenueStatusPill({ venue }: { venue: Venue }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
      <span className={`size-1.5 rounded-full ${venue.shopOpen ? "bg-emerald-400" : "bg-white/30"}`} />
      {venue.shopOpen ? "Open now" : "Closed"} · {formatTime12h(venue.openTime)} to {formatTime12h(venue.closeTime)}
    </span>
  );
}
