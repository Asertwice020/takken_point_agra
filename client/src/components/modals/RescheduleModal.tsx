import { useState } from "react";
import { rescheduleBooking } from "../../api/booking.api";
import { useSlots } from "../../hooks/useSlots";
import type { MyBooking } from "../../types/booking.types";
import { getErrorMessage } from "../../utils/errorMessages";
import { formatDateLabel, formatDuration, formatTime12h, getIstDate } from "../../utils/format";
import DateTabs from "../booking/DateTabs";
import SlotGrid from "../booking/SlotGrid";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type RescheduleModalProps = {
  booking: MyBooking;
  gameId: number;
  bookingDaysAhead: number;
  onClose: () => void;
  onDone: (message: string) => void;
};

// ==========================================
// * RESCHEDULE: same game and same length, so nothing more to pay
// ==========================================
export default function RescheduleModal({ booking, gameId, bookingDaysAhead, onClose, onDone }: RescheduleModalProps) {
  const dates = Array.from({ length: Math.min(bookingDaysAhead, 6) + 1 }, (_, index) => getIstDate(index));
  const [date, setDate] = useState(dates.includes(booking.booking_date) ? booking.booking_date : dates[0]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const { data, isLoading } = useSlots(gameId, date, booking.duration_minutes);

  const currentTime = booking.start_time.slice(0, 5);
  const slots = (data?.slots ?? []).map((slot) =>
    date === booking.booking_date && slot.startTime === currentTime ? { ...slot, isBookable: false, reason: "CURRENT" } : slot,
  );

  const pickDate = (value: string) => { setDate(value); setStartTime(null); };

  const submit = async () => {
    if (!startTime) return;
    setIsSaving(true);
    setError("");
    try {
      await rescheduleBooking(booking.id, { bookingDate: date, startTime });
      onDone(`Moved to ${formatDateLabel(date)}, ${formatTime12h(startTime)}.`);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen isWide title="Reschedule" onClose={onClose}>
      <p className="text-sm text-muted">
        {booking.game_name} · {formatDuration(booking.duration_minutes)}. Same game and length, so there is nothing more to pay. You can reschedule once.
      </p>
      <div className="mt-5 space-y-5">
        <DateTabs dates={dates} selected={date} onSelect={pickDate} />
        <SlotGrid slots={slots} selectedTime={startTime} isLoading={isLoading} onSelect={setStartTime} />
      </div>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      <Button variant="primary" className="mt-6 w-full" disabled={!startTime || isSaving} onClick={() => void submit()}>
        {isSaving ? "Please wait..." : "Move my booking"}
      </Button>
    </Modal>
  );
}
