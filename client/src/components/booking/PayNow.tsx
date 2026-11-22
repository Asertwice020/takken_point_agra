import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { markBookingPaid } from "../../api/booking.api";
import type { BookingState } from "../../types/booking.types";
import { formatPrice } from "../../utils/format";
import { getApiErrorCode, getErrorMessage } from "../../utils/errorMessages";
import { sanitizeUtr } from "../../utils/sanitize";
import { utrSchema, type UtrForm } from "../../validators/booking.schema";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import Countdown from "./Countdown";

type PayNowProps = { booking: BookingState; onPaid: () => void };

export default function PayNow({ booking, onPaid }: PayNowProps) {
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UtrForm>({ resolver: zodResolver(utrSchema) });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await markBookingPaid(booking.id, values.utr);
      onPaid();
    } catch (error) {
      setServerError(getErrorMessage(error));
      if (getApiErrorCode(error) === "HOLD_EXPIRED") onPaid();
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs text-muted">Amount to pay</p>
        <p className="font-serif text-4xl">{formatPrice(booking.amount)}</p>
        {booking.holdExpiresAt && <p className="mt-1 text-xs text-muted">Seat held for <Countdown until={booking.holdExpiresAt} /></p>}
      </div>

      {booking.upiLink && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg bg-white p-3">
            <QRCodeSVG value={booking.upiLink} size={176} bgColor="#ffffff" fgColor="#191919" />
          </div>
          <p className="text-xs text-muted">Scan with any UPI app</p>
          <a href={booking.upiLink} className="inline-flex rounded-md border border-line px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-hover lg:hidden">Pay with UPI app</a>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 border-t border-line pt-6">
        <p className="text-sm text-muted">After paying, enter the 12-digit UTR (UPI reference number) shown in your payment app.</p>
        <TextField label="UTR number" variant="code" sanitize={sanitizeUtr} autoComplete="off" inputMode="numeric" maxLength={12} placeholder="000000000000" error={errors.utr?.message} {...register("utr")} />
        {serverError && <p className="text-sm text-red-300">{serverError}</p>}
        <Button variant="primary" className="w-full" disabled={isSubmitting}>I've paid</Button>
      </form>
    </div>
  );
}
