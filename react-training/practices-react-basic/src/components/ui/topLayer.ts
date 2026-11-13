import { useSyncExternalStore } from 'react'

let host: HTMLElement | null = null
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getHost(): HTMLElement | null {
  return host
}

export function setTopLayerHost(element: HTMLElement): void {
  if (host === element) return
  host = element
  notify()
}

export function clearTopLayerHost(element: HTMLElement): void {
  if (host !== element) return
  host = null
  notify()
}

export function useTopLayerHost(): HTMLElement | null {
  return useSyncExternalStore(subscribe, getHost, getHost)
}
