import { showToast } from "../ui/uiToast.js";

export function initGlobalErrorHandler() {
  window.addEventListener("unhandledrejection", (event) => {
    event.preventDefault();

    const error = event.reason;
    const uiMessage = error.message || "A system error occurred";
    showToast(uiMessage, "error");
  });
}
