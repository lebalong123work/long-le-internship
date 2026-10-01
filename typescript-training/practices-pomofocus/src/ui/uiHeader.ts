import { DOM } from "@/ui/dom";
import { getCurrentUserId, logoutUser } from "@/logic/authLogic";

export const initHeaderEvents = (): void => {
  const userId: string | null = getCurrentUserId();

  if (userId !== null) {
    if (DOM.guestBlock !== null) DOM.guestBlock.classList.add("hidden");
    if (DOM.userBlock !== null) DOM.userBlock.classList.remove("hidden");
  } else {
    if (DOM.guestBlock !== null) DOM.guestBlock.classList.remove("hidden");
    if (DOM.userBlock !== null) DOM.userBlock.classList.add("hidden");
  }

  if (DOM.logoutBtn !== null) {
    DOM.logoutBtn.addEventListener("click", (): void => {
      logoutUser();
      window.location.reload();
    });
  }

  if (DOM.guestMenuBtn !== null) {
    DOM.guestMenuBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.guestDropdown !== null) {
        const isExpanded = DOM.guestDropdown.classList.toggle("hidden") === false;
        DOM.guestMenuBtn?.setAttribute("aria-expanded", String(isExpanded));
      }
    });
  }

  if (DOM.avatarMenuBtn !== null) {
    DOM.avatarMenuBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.userDropdown !== null) {
        const isExpanded = DOM.userDropdown.classList.toggle("hidden") === false;
        DOM.avatarMenuBtn?.setAttribute("aria-expanded", String(isExpanded));
      }
    });
  }

  document.addEventListener("click", (): void => {
    if (
      DOM.guestDropdown !== null &&
      !DOM.guestDropdown.classList.contains("hidden")
    ) {
      DOM.guestDropdown.classList.add("hidden");
      DOM.guestMenuBtn?.setAttribute("aria-expanded", "false");
    }
    if (
      DOM.userDropdown !== null &&
      !DOM.userDropdown.classList.contains("hidden")
    ) {
      DOM.userDropdown.classList.add("hidden");
      DOM.avatarMenuBtn?.setAttribute("aria-expanded", "false");
    }
  });
};
