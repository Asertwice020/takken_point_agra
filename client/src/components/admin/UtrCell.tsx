import { useState } from "react";
import { revealUtr } from "../../api/owner.api";

type UtrCellProps = { bookingId: number; masked: string | null };

// * Shows the UTR masked (••••1234). "Show" asks the server for the full number.
export default function UtrCell({ bookingId, masked }: UtrCellProps) {
  const [utr, setUtr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  if (!masked) return <span className="text-muted">-</span>;

  const reveal = async () => {
    setIsLoading(true);
    try {
      setUtr(await revealUtr(bookingId));
    } catch {
      // keep it masked
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm">
      {utr ?? masked}
      {!utr && (
        <button className="font-sans text-xs text-muted underline underline-offset-2 hover:text-ink" disabled={isLoading} onClick={() => void reveal()}>
          {isLoading ? "..." : "Show"}
        </button>
      )}
    </span>
  );
}
