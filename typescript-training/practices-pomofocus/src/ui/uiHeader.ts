import { DOM } from "./dom.ts";
import { getCurrentUserId, logoutUser } from "../logic/authLogic.ts";

export function initHeaderEvents() {
  const userId = getCurrentUserId();

  if (userId) {
    if (DOM.guestBlock) DOM.guestBlock.classList.add("hidden");
    if (DOM.userBlock) DOM.userBlock.classList.remove("hidden");
  } else {
    if (DOM.guestBlock) DOM.guestBlock.classList.remove("hidden");
    if (DOM.userBlock) DOM.userBlock.classList.add("hidden");
  }

  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", () => {
      logoutUser();
      window.location.reload();
    });
  }

  if (DOM.guestMenuBtn && DOM.guestDropdown) {
    DOM.guestMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.guestDropdown.classList.toggle("hidden");
    });
  }

  if (DOM.avatarMenuBtn !== null && DOM.userDropdown) {
    DOM.avatarMenuBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.userDropdown !== null) {
        DOM.userDropdown.classList.toggle("hidden");
      }
    });
  }

  document.addEventListener("click", (): void => {
    if (DOM.guestDropdown !== null && !DOM.guestDropdown.classList.contains("hidden")) {
      DOM.guestDropdown.classList.add("hidden");
    }
    if (DOM.userDropdown !== null && !DOM.userDropdown.classList.contains("hidden")) {
      DOM.userDropdown.classList.add("hidden");
    }
  });
}
