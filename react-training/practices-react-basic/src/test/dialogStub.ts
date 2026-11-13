export function installDialogStub(): void {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
