import { showToast } from "../ui/uiToast.ts";

export function initGlobalErrorHandler() {
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    event.preventDefault();

    const error = event.reason as Error;
    const uiMessage = error.message || "A system error occurred";
    showToast(uiMessage, "error");
  });
}
