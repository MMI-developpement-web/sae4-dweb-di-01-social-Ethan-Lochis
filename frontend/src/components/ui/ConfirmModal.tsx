import Button from "./Button";
import { IconSpinner } from "./Icons";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      onCancel={onCancel}
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      role="dialog"
      className="fixed inset-0 z-100 rounded-lg bg-bg-lighter p-6 shadow-xl ring-1 ring-white/10 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <h2 id="confirm-modal-title" className="text-xl font-semibold text-fg">{title}</h2>
      <p className="mt-2 text-fg/70 leading-relaxed">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          <div className="flex items-center gap-2">
            {isLoading && <IconSpinner className="size-4" />}
            {confirmText}
          </div>
        </Button>
      </div>
    </dialog>
  );
}