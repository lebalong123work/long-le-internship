import { Button } from "@/components/common/Button";
import { Overlay } from "@/components/common/Overlay";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <section
        className="confirmation"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-desc"
      >
        <h2 className="confirmation_title" id="confirmation-title">
          {title}
        </h2>
        <p className="confirmation_desc" id="confirmation-desc">
          {message}
        </p>
        <div className="confirmation_actions">
          <Button variant="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </section>
    </Overlay>
  );
}
