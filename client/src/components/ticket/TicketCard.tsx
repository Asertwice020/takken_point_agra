import { QRCodeSVG } from "qrcode.react";
import { formatDateLabel, formatDuration, formatTime12h } from "../../utils/format";

type TicketCardProps = { gameName: string; date: string; startTime: string; durationMinutes: number; ticketCode: string };

export default function TicketCard({ gameName, date, startTime, durationMinutes, ticketCode }: TicketCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={ticketCode} size={176} bgColor="#ffffff" fgColor="#191919" />
      </div>
      <p className="font-mono text-lg tracking-widest">{ticketCode}</p>
      <p className="text-sm text-muted">{gameName} · {formatDateLabel(date)}, {formatTime12h(startTime)} · {formatDuration(durationMinutes)}</p>
    </div>
  );
}
