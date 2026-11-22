import { formatDateLabel, formatDuration, formatPrice, formatTime12h } from "../../utils/format";
import Button from "../ui/Button";

type BookingSummaryProps = {
  gameName: string | null;
  date: string | null;
  startTime: string | null;
  durationMinutes: number;
  price: number | null;
  notice: string;
  isBusy: boolean;
  onContinue: () => void;
};

// ==========================================
// * LIVE SUMMARY: matching panel on desktop, bottom bar on phones
// ==========================================
export default function BookingSummary({ gameName, date, startTime, durationMinutes, price, notice, isBusy, onContinue }: BookingSummaryProps) {
  const isReady = Boolean(gameName && date && startTime) && !isBusy;
  const rows: [string, string][] = [
    ["Game", gameName ?? "-"],
    ["Date", date ? formatDateLabel(date) : "-"],
    ["Time", startTime ? formatTime12h(startTime) : "Pick a time"],
    ["Duration", formatDuration(durationMinutes)],
  ];

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-line bg-panel p-6">
          <h2 className="font-serif text-xl">Your booking</h2>
          <dl className="mt-5 space-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-sm text-muted">Total</span>
            <span className="font-serif text-2xl">{price !== null ? formatPrice(price) : "-"}</span>
          </div>
          <Button variant="primary" className="mt-5 w-full" disabled={!isReady} onClick={onContinue}>
            {isBusy ? "Please wait..." : "Continue to pay"}
          </Button>
          {notice && <p className="mt-3 text-xs text-red-300">{notice}</p>}
          <ul className="mt-5 space-y-1 text-xs text-muted">
            <li>Late arrivals lose that time.</li>
            <li>You can reschedule once, up to 2 hours before.</li>
          </ul>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="min-w-0 text-sm">
            <p className="truncate">{startTime ? `${gameName} · ${formatTime12h(startTime)}` : "Pick a time"}</p>
            <p className="text-xs text-muted">{date ? formatDateLabel(date) : ""} · {formatDuration(durationMinutes)}</p>
          </div>
          <Button variant="primary" disabled={!isReady} onClick={onContinue}>
            {isBusy ? "Please wait..." : price !== null ? `Continue · ${formatPrice(price)}` : "Continue"}
          </Button>
        </div>
        {notice && <p className="mt-2 text-center text-xs text-red-300">{notice}</p>}
      </div>
    </>
  );
}
