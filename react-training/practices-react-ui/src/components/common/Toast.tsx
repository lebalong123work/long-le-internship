import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type,
  isOpen,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, isOpen, message, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`toast toast-${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      {message}
    </div>
  );
}
