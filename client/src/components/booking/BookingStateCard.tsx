import type { ReactNode } from "react";

type BookingStateCardProps = { title: string; text: string; isWaiting?: boolean; children?: ReactNode };

export default function BookingStateCard({ title, text, isWaiting = false, children }: BookingStateCardProps) {
  return (
    <div className="space-y-4 text-center">
      {isWaiting && <div className="mx-auto size-3 animate-pulse rounded-full bg-white/40" />}
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}
