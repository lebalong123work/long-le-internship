export async function withButtonLoading(
  buttonId: string,
  action: () => Promise<void>,
  loadingText: string = "Loading...",
): Promise<void> {
  const button = document.getElementById(buttonId);

  if (!(button instanceof HTMLButtonElement)) {
    await action();
    return;
  }

  const originalText: string | null = button.textContent;

  button.disabled = true;
  button.textContent = loadingText;

  try {
    await action();
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}
