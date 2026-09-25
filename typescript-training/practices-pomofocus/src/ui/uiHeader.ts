import { DOM } from "./dom.js";
import { getCurrentUserId, logoutUser } from "../logic/authLogic.js";

export function initHeaderEvents(): void {
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
        DOM.guestDropdown.classList.toggle("hidden");
      }
    });
  }

  if (DOM.avatarMenuBtn !== null) {
    DOM.avatarMenuBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.userDropdown !== null) {
        DOM.userDropdown.classList.toggle("hidden");
      }
    });
  }

  document.addEventListener("click", (): void => {
    if (
      DOM.guestDropdown !== null &&
      !DOM.guestDropdown.classList.contains("hidden")
    ) {
      DOM.guestDropdown.classList.add("hidden");
    }
    if (
      DOM.userDropdown !== null &&
      !DOM.userDropdown.classList.contains("hidden")
    ) {
      DOM.userDropdown.classList.add("hidden");
    }
  });
}
