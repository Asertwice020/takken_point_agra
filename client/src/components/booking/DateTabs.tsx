import { formatDateLabel } from "../../utils/format";

type DateTabsProps = { dates: string[]; selected: string; onSelect: (date: string) => void };

const dayName = (date: string, index: number) => (index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDateLabel(date).split(",")[0]);

export default function DateTabs({ dates, selected, onSelect }: DateTabsProps) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))` }}>
      {dates.map((date, index) => (
        <button
          key={date}
          onClick={() => onSelect(date)}
          className={`rounded-lg border px-4 py-2 text-center transition-colors duration-150 ${date === selected ? "border-white/40 bg-white/10" : "border-line hover:bg-hover"}`}
        >
          <span className="block text-sm">{dayName(date, index)}</span>
          <span className="block text-xs text-muted">{formatDateLabel(date).split(", ")[1]}</span>
        </button>
      ))}
    </div>
  );
}
