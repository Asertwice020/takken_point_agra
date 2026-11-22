import type { Slot } from "../../types/booking.types";
import { formatTime12h } from "../../utils/format";

type Props = { slots: Slot[]; selectedTime: string | null; isLoading: boolean; onSelect: (time: string) => void };

export default function SlotGrid({ slots, selectedTime, isLoading, onSelect }: Props) {
  const visibleSlots = slots.filter((slot) => slot.reason !== "SLOT_PAST");
  if (!visibleSlots.length) {
    return <p className="text-sm text-muted">{isLoading ? "Loading times..." : "No times left for this day."}</p>;
  }
  return (
    <div className={`grid grid-cols-3 gap-2 sm:grid-cols-4 ${isLoading ? "opacity-50" : ""}`}>
      {visibleSlots.map((slot) => (
        <button
          key={slot.startTime}
          disabled={!slot.isBookable}
          onClick={() => onSelect(slot.startTime)}
          className={`rounded-md border px-2 py-2.5 text-center transition-colors duration-150 disabled:cursor-not-allowed ${slot.startTime === selectedTime ? "border-white/40 bg-white/10" : "border-line hover:bg-hover"} ${slot.isBookable ? "" : "opacity-40"}`}
        >
          <span className={`block text-sm ${slot.isBookable ? "" : "line-through"}`}>{formatTime12h(slot.startTime)}</span>
          <span className="block text-xs text-muted">
            {slot.isBookable ? `${slot.seatsLeft} left` : slot.reason === "SLOT_FULL" ? "Full" : slot.reason === "CURRENT" ? "Your slot" : "Closed"}
          </span>
        </button>
      ))}
    </div>
  );
}
