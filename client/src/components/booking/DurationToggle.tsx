import type { Duration } from "../../types/booking.types";
import { formatDuration, formatPrice } from "../../utils/format";

type DurationToggleProps = { options: Duration[]; selected: number; onSelect: (minutes: number) => void };

export default function DurationToggle({ options, selected, onSelect }: DurationToggleProps) {
  return (
    <div className="grid gap-1 rounded-lg border border-line p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <button
          key={option.minutes}
          onClick={() => onSelect(option.minutes)}
          className={`rounded-md px-4 py-2 text-sm transition-colors duration-150 ${option.minutes === selected ? "bg-white/10" : "text-muted hover:bg-hover"}`}
        >
          {formatDuration(option.minutes)} · {formatPrice(option.price)}
        </button>
      ))}
    </div>
  );
}
