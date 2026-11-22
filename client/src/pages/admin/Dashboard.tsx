import { useState } from "react";
import { confirmBooking, rejectBooking, setShopStatus } from "../../api/owner.api";
import BookingsTable from "../../components/admin/BookingsTable";
import PendingPaymentCard from "../../components/admin/PendingPaymentCard";
import ShopSwitch from "../../components/admin/ShopSwitch";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import Button from "../../components/ui/Button";
import { useOwnerBookings } from "../../hooks/useOwnerBookings";
import { usePendingPayments } from "../../hooks/usePendingPayments";
import { useVenue } from "../../hooks/useVenue";
import type { OwnerBooking } from "../../types/owner.types";
import { enableAlertSound } from "../../utils/alertSound";
import { getErrorMessage } from "../../utils/errorMessages";
import { getIstDate } from "../../utils/format";

// ==========================================
// * OWNER DASHBOARD: shop switch, payments to confirm, bookings by day
// ==========================================
export default function Dashboard() {
  const { data: venue } = useVenue();
  const [shopOverride, setShopOverride] = useState<boolean | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [date, setDate] = useState(getIstDate(0));
  const [notice, setNotice] = useState("");
  const [rejecting, setRejecting] = useState<OwnerBooking | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const { pending, hasError: hasPendingError, reload: reloadPending } = usePendingPayments(isSoundOn);
  const { data: bookings, reload: reloadBookings } = useOwnerBookings(date);

  const isShopOpen = shopOverride ?? venue?.shopOpen ?? null;
  const refresh = () => { void reloadPending(); reloadBookings(); };

  const toggleShop = async (next: boolean) => {
    setIsSwitching(true);
    setNotice("");
    try {
      const result = await setShopStatus(next);
      setShopOverride(result.shopOpen);
      if (result.shopOpen && result.waitingCount > 0) setNotice(`${result.waitingCount} payment${result.waitingCount === 1 ? " is" : "s are"} waiting for you.`);
      refresh();
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSwitching(false);
    }
  };

  // * Never throws: errors (for example "Seat no longer available. Refund ₹60...") show in the notice
  const confirm = async (booking: OwnerBooking) => {
    setNotice("");
    try {
      await confirmBooking(booking.id);
      setNotice(`Confirmed ${booking.customer_name ?? "the"} booking. The ticket was emailed.`);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
    refresh();
  };

  const reject = async () => {
    if (!rejecting) return;
    setIsRejecting(true);
    try {
      await rejectBooking(rejecting.id);
      setNotice("Payment rejected.");
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsRejecting(false);
      setRejecting(null);
      refresh();
    }
  };

  const toggleSound = async () => {
    if (isSoundOn) return setIsSoundOn(false);
    try {
      await enableAlertSound();
      setIsSoundOn(true);
    } catch {
      setNotice("Sound is not available in this browser.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl tracking-tight">Dashboard</h1>
        <Button onClick={() => void toggleSound()}>{isSoundOn ? "Turn off sound alerts" : "Turn on sound alerts"}</Button>
      </div>

      {isShopOpen === null ? <div className="h-24 animate-pulse rounded-xl bg-hover" /> : <ShopSwitch isOpen={isShopOpen} isBusy={isSwitching} onToggle={(next) => void toggleShop(next)} />}

      {notice && <p className="rounded-lg border border-line bg-panel px-4 py-3 text-sm">{notice}</p>}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl">Waiting for confirmation</h2>
          {pending && pending.length > 0 && <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-300">{pending.length}</span>}
        </div>
        {hasPendingError && <p className="text-xs text-red-300">Could not refresh. Trying again...</p>}
        {pending === null ? (
          <div className="h-24 animate-pulse rounded-xl bg-hover" />
        ) : pending.length ? (
          pending.map((booking) => <PendingPaymentCard key={booking.id} booking={booking} onConfirm={confirm} onReject={setRejecting} />)
        ) : (
          <p className="rounded-xl border border-line bg-panel p-6 text-center text-sm text-muted">No payments waiting.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Bookings</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-md border border-line bg-hover px-3 py-2 text-sm text-ink outline-none focus:border-white/40 [color-scheme:dark]"
            />
            <Button className="px-3 py-2" onClick={() => setDate(getIstDate(0))}>Today</Button>
          </div>
        </div>
        <BookingsTable bookings={bookings ?? []} onLateConfirm={confirm} />
      </section>

      <ConfirmDialog
        isOpen={rejecting !== null}
        title="Reject this payment?"
        text={`${rejecting?.customer_name ?? "The customer"} will see "Payment not verified". Only reject if you cannot find the payment in your bank statement.`}
        confirmLabel="Reject payment"
        isBusy={isRejecting}
        onConfirm={() => void reject()}
        onClose={() => setRejecting(null)}
      />
    </div>
  );
}
