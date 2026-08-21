// uiLoader.js

export function removeInitialLoader() {
  const initialLoader = document.getElementById("initial-loader");

  if (initialLoader) {
    initialLoader.style.opacity = "0";

    setTimeout(() => {
      initialLoader.remove();
    }, 300);
  }
}
