import { DOM } from "./dom.js";
import { getCurrentUserId, logoutUser } from "./authLogic.js";

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

  if (DOM.avatarMenuBtn && DOM.userDropdown) {
    DOM.avatarMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.userDropdown.classList.toggle("hidden");
    });
  }

  document.addEventListener("click", () => {
    if (DOM.guestDropdown && !DOM.guestDropdown.classList.contains("hidden")) {
      DOM.guestDropdown.classList.add("hidden");
    }
    if (DOM.userDropdown && !DOM.userDropdown.classList.contains("hidden")) {
      DOM.userDropdown.classList.add("hidden");
    }
  });
}
