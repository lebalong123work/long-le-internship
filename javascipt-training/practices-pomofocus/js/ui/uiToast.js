import { CONFIG } from "../config/config.js";
function getToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = "error") {
  const container = getToastContainer();
  const toast = document.createElement("div");

  toast.classList.add("toast", type);
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, CONFIG.UI.TOAST_DURATION);
}