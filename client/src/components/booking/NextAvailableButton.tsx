import type { NextAvailable } from "../../types/booking.types";
import { formatDateLabel, formatTime12h, getIstDate } from "../../utils/format";
import Button from "../ui/Button";

type Props = { next: NextAvailable | null; isLoading: boolean; onPick: (next: NextAvailable) => void };

export default function NextAvailableButton({ next, isLoading, onPick }: Props) {
  if (isLoading) return <div className="h-10 w-72 animate-pulse rounded-md bg-hover" />;
  if (!next) return <p className="text-sm text-muted">No seats left for the coming days.</p>;
  const dayLabel = next.date === getIstDate(0) ? "Today" : formatDateLabel(next.date);
  return (
    <Button onClick={() => onPick(next)}>
      Next available: {dayLabel}, {formatTime12h(next.startTime)} · {next.gameName}
    </Button>
  );
}
