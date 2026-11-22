type ShopSwitchProps = { isOpen: boolean; isBusy: boolean; onToggle: (next: boolean) => void };

// * The shop ON/OFF switch. It exists only on the owner dashboard; customers just see a read-only label.
export default function ShopSwitch({ isOpen, isBusy, onToggle }: ShopSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel p-5">
      <div>
        <p className="font-serif text-xl">{isOpen ? "Shop is open" : "Shop is closed"}</p>
        <p className="mt-1 text-sm text-muted">
          {isOpen
            ? "Payment alerts are on. A waiting payment has 30 minutes."
            : "Customers can still book. Their payments wait until you open."}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={isOpen}
        aria-label="Shop open"
        disabled={isBusy}
        onClick={() => onToggle(!isOpen)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 disabled:opacity-50 ${isOpen ? "bg-emerald-400/70" : "bg-white/15"}`}
      >
        <span className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white transition-transform duration-150 ${isOpen ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
