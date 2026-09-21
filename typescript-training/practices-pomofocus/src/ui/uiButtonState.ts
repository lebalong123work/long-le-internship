export async function withButtonLoading(
  buttonId,
  action,
  loadingText = "Loading...",
) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return await action();
  }

  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = loadingText;

  try {
    await action();
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}
