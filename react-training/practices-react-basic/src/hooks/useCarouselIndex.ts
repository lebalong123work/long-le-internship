import { useState } from 'react'

export interface CarouselIndex {
  activeIndex: number
  next: () => void
  prev: () => void
  goTo: (index: number) => void
}

function normalizeCount(count: number): number {
  return Number.isFinite(count) && count >= 1 ? Math.floor(count) : 0
}

function clampIndex(index: number, total: number): number {
  return Math.min(index, total - 1)
}

export function useCarouselIndex(count: number): CarouselIndex {
  const total = normalizeCount(count)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const activeIndex = total === 0 ? 0 : clampIndex(selectedIndex, total)

  function next(): void {
    if (total === 0) return
    setSelectedIndex((current) => (clampIndex(current, total) + 1) % total)
  }

  function prev(): void {
    if (total === 0) return
    setSelectedIndex((current) => (clampIndex(current, total) - 1 + total) % total)
  }

  function goTo(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= total) return
    setSelectedIndex(index)
  }

  return { activeIndex, next, prev, goTo }
}
