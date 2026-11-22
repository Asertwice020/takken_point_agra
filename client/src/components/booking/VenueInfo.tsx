import type { Venue } from "../../types/venue.types";
import { formatTime12h } from "../../utils/format";

const address = import.meta.env.VITE_VENUE_ADDRESS as string | undefined;
const mapsUrl = import.meta.env.VITE_MAPS_URL as string | undefined;
const whatsappNumber = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "").replace(/\D/g, "");
const LINK_STYLE = "inline-block rounded-md border border-line px-3 py-2 text-sm transition-colors duration-150 hover:bg-hover";

interface VenueInfoProps {
  venue: Venue;
  ticketNumber?: string;
  amount?: number | string;
}

function buildWhatsAppUrl(phone: string, venueName: string, ticketNumber?: string, amount?: number | string): string {
  const formattedAmount = typeof amount === "number" ? `₹${amount.toLocaleString("en-IN")}` : amount;

  const message =
    ticketNumber && formattedAmount
      ? [
          `Hello *${venueName}* 👋`,
          ``,
          `I would like to confirm my booking details:`,
          `• *Ticket No:* ${ticketNumber}`,
          `• *Amount Paid:* ${formattedAmount}`,
          ``,
          `Please verify and confirm my slot. Thank you!`,
        ].join("\n")
      : `Hello *${venueName}*, I have a query regarding a booking.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function VenueInfo({ venue, ticketNumber, amount }: VenueInfoProps) {
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, venue.name || "Taken Point Agra", ticketNumber, amount)
    : "";

  return (
    <section className="mt-6 grid gap-6 sm:grid-cols-2">
      <div className="rounded-xl border border-line bg-panel p-6">
        <h2 className="font-serif text-xl">Find us</h2>
        {address && <p className="mt-3 text-sm text-muted">{address}</p>}
        <p className="mt-2 text-sm text-muted">Open daily, {formatTime12h(venue.openTime)} to {formatTime12h(venue.closeTime)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {mapsUrl && <a className={LINK_STYLE} href={mapsUrl} target="_blank" rel="noreferrer">Open in Maps</a>}
          {whatsappUrl && (
            <a className={LINK_STYLE} href={whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-panel p-6">
        <h2 className="font-serif text-xl">Good to know</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>Your slot time is fixed. Late arrivals lose that time.</li>
          <li>You can reschedule once, up to 2 hours before your slot.</li>
          <li>If the shop is closed, your booking is confirmed when we open.</li>
        </ul>
      </div>
    </section>
  );
}







// import type { Venue } from "../../types/venue.types";
// import { formatTime12h } from "../../utils/format";

// const address = import.meta.env.VITE_VENUE_ADDRESS as string | undefined;
// const mapsUrl = import.meta.env.VITE_MAPS_URL as string | undefined;
// const whatsappNumber = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "").replace(/\D/g, "");
// const LINK_STYLE = "inline-block rounded-md border border-line px-3 py-2 text-sm transition-colors duration-150 hover:bg-hover";

// export default function VenueInfo({ venue }: { venue: Venue }) {
//   return (
//     <section className="mt-6 grid gap-6 sm:grid-cols-2">
//       <div className="rounded-xl border border-line bg-panel p-6">
//         <h2 className="font-serif text-xl">Find us</h2>
//         {address && <p className="mt-3 text-sm text-muted">{address}</p>}
//         <p className="mt-2 text-sm text-muted">Open daily, {formatTime12h(venue.openTime)} to {formatTime12h(venue.closeTime)}</p>
//         <div className="mt-4 flex flex-wrap gap-2">
//           {mapsUrl && <a className={LINK_STYLE} href={mapsUrl} target="_blank" rel="noreferrer">Open in Maps</a>}
//           {whatsappNumber && <a className={LINK_STYLE} href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp us</a>}
//         </div>
//       </div>
//       <div className="rounded-xl border border-line bg-panel p-6">
//         <h2 className="font-serif text-xl">Good to know</h2>
//         <ul className="mt-3 space-y-2 text-sm text-muted">
//           <li>Your slot time is fixed. Late arrivals lose that time.</li>
//           <li>You can reschedule once, up to 2 hours before your slot.</li>
//           <li>If the shop is closed, your booking is confirmed when we open.</li>
//         </ul>
//       </div>
//     </section>
//   );
// }
