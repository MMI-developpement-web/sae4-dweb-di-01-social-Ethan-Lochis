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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-bg-lighter p-6 shadow-xl ring-1 ring-white/10">
        <h2 className="text-xl font-semibold text-fg">{title}</h2>
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
      </div>
    </div>
  );
}