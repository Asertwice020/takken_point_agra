import Button from "../ui/Button";
import Modal from "../ui/Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  isBusy: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ isOpen, title, text, confirmLabel, isBusy, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <p className="text-sm text-muted">{text}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button onClick={onClose} disabled={isBusy}>Cancel</Button>
        <Button className="text-red-300" onClick={onConfirm} disabled={isBusy}>{isBusy ? "Please wait..." : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
