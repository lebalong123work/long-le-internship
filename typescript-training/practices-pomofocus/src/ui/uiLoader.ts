import { CONFIG } from "../config/config.ts";
export function removeInitialLoader(): void {
  const initialLoader: HTMLElement | null =
    document.getElementById("initial-loader");

  if (initialLoader !== null) {
    initialLoader.style.opacity = "0";

    setTimeout((): void => {
      initialLoader.remove();
    }, CONFIG.UI.LOADER_FADE_TIME);
  }
}
