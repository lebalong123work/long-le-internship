import { showToast } from "@/ui/uiToast";

const getRejectionMessage = (reason: unknown): string => {
  const fallbackMessage = "A system error occurred";
  const seenErrors = new Set<Error>();
  let rootReason = reason;
  while (
    rootReason instanceof Error &&
    rootReason.cause !== undefined &&
    !seenErrors.has(rootReason)
  ) {
    seenErrors.add(rootReason);
    rootReason = rootReason.cause;
  }

  if (rootReason instanceof Error && rootReason.message.trim() !== "") {
    return rootReason.message;
  }

  if (
    typeof rootReason === "string" &&
    rootReason.trim() !== ""
  ) {
    return rootReason;
  }

  if (
    typeof rootReason === "object" &&
    rootReason !== null &&
    "message" in rootReason &&
    typeof rootReason.message === "string" &&
    rootReason.message.trim() !== ""
  ) {
    return rootReason.message;
  }

  return fallbackMessage;
};

export const initGlobalErrorHandler = (): void => {
  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      event.preventDefault();

      const uiMessage = getRejectionMessage(event.reason);
      showToast(uiMessage, "error");
    },
  );
};
