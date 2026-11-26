export interface StripItemBox {
  left: number
  width: number
}

export interface StripViewBox {
  scrollLeft: number
  width: number
}

export function scrollLeftToShow(item: StripItemBox, view: StripViewBox): number {
  if (item.width <= 0 || view.width <= 0) return view.scrollLeft
  const itemRight = item.left + item.width
  const viewRight = view.scrollLeft + view.width
  if (item.left < view.scrollLeft || item.width > view.width) return item.left
  if (itemRight > viewRight) return itemRight - view.width
  return view.scrollLeft
}
