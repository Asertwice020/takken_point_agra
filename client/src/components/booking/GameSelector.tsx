import type { Game } from "../../types/booking.types";
import { formatPrice } from "../../utils/format";

type Props = { games: Game[]; selectedId: number | null; onSelect: (id: number) => void };

export default function GameSelector({ games, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {games.map((game) => {
        const lowestPrice = Math.min(...game.durations.map((option) => option.price));
        return (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className={`rounded-lg border p-4 text-left transition-colors duration-150 ${game.id === selectedId ? "border-white/40 bg-white/10" : "border-line hover:bg-hover"}`}
          >
            <span className="block font-serif text-xl">{game.name}</span>
            <span className="mt-1 block text-xs text-muted">From {formatPrice(lowestPrice)}</span>
          </button>
        );
      })}
    </div>
  );
}
