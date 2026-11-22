import { useEffect, type ReactNode } from "react";

type ModalProps = { isOpen: boolean; title: string; onClose: () => void; children: ReactNode; isWide?: boolean };

export default function Modal({ isOpen, title, onClose, children, isWide = false }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90dvh] w-full overflow-y-auto rounded-xl border border-line bg-panel p-6 ${isWide ? "max-w-lg" : "max-w-sm"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-serif text-2xl">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
