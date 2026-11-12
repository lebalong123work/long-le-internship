interface MatchMediaController {
  setMatches: (matches: boolean) => void
  listenerCount: () => number
}

export function installMatchMediaStub(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches
  const listeners = new Set<EventListener>()

  function stubList(query: string): MediaQueryList {
    const list = Object.assign(new EventTarget(), {
      media: query,
      onchange: null,
      matches,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: (_type: string, listener: EventListener) => {
        listeners.add(listener)
      },
      removeEventListener: (_type: string, listener: EventListener) => {
        listeners.delete(listener)
      },
    })
    Object.defineProperty(list, 'matches', { get: () => matches })
    return list
  }

  window.matchMedia = stubList

  return {
    setMatches: (next) => {
      matches = next
      listeners.forEach((listener) => listener(new Event('change')))
    },
    listenerCount: () => listeners.size,
  }
}
