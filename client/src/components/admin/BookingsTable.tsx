import type { OwnerBooking } from "../../types/owner.types";
import { formatDuration, formatPrice, formatTime12h } from "../../utils/format";
import Button from "../ui/Button";
import StatusTag from "../ui/StatusTag";
import UtrCell from "./UtrCell";

type BookingsTableProps = { bookings: OwnerBooking[]; onLateConfirm: (booking: OwnerBooking) => Promise<void> };

const HEADERS = ["Time", "Game", "Customer", "Amount", "UTR", "Status", ""];

// * Notion-style table. Expired bookings that have a UTR can still be confirmed (the server checks the seat is free).
export default function BookingsTable({ bookings, onLateConfirm }: BookingsTableProps) {
  if (!bookings.length) {
    return <p className="rounded-xl border border-line bg-panel p-6 text-center text-sm text-muted">No bookings for this day.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>{HEADERS.map((header, index) => <th key={index} className="px-4 py-3 font-normal">{header}</th>)}</tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-line last:border-0 hover:bg-hover">
              <td className="px-4 py-3 whitespace-nowrap">{formatTime12h(booking.start_time)} <span className="text-muted">· {formatDuration(booking.duration_minutes)}</span></td>
              <td className="px-4 py-3">{booking.game_name}</td>
              <td className="px-4 py-3">{booking.customer_name ?? "-"}<span className="block text-xs text-muted">{booking.customer_phone}</span></td>
              <td className="px-4 py-3">{formatPrice(booking.amount)}</td>
              <td className="px-4 py-3"><UtrCell bookingId={booking.id} masked={booking.utrMasked} /></td>
              <td className="px-4 py-3"><StatusTag status={booking.status} /></td>
              <td className="px-4 py-3 text-right">
                {booking.status === "EXPIRED" && booking.hasUtr && (
                  <Button className="px-3 py-1.5" onClick={() => void onLateConfirm(booking)}>Confirm anyway</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
