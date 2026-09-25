import { CONFIG } from "../config/config.js";

export type ToastType = "error" | "success" | "warning";

function getToastContainer(): HTMLElement {
  let container: HTMLElement | null =
    document.getElementById("toast-container");
  if (container === null) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message: string, type = "error"): void {
  const container: HTMLElement = getToastContainer();
  const toast: HTMLDivElement = document.createElement("div");

  toast.classList.add("toast", type);
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, CONFIG.UI.TOAST_DURATION);
}
