import { useId, useRef } from 'react'
import { SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { DISABLED_CURSOR, FOCUS_RING } from '@/components/ui/interactionClasses'
import { TAB_LOOK } from '@/components/ui/tabClasses'
import { TABS_ERRORS } from '@/components/ui/tabsErrors'
import { cn } from '@/utils/cn'
import type { KeyboardEvent, ReactNode, Ref } from 'react'

export interface TabItem<T extends string> {
  id: T
  label: string
}

type ActivationMode = 'automatic' | 'manual'

interface TabsProps<T extends string> {
  items: readonly TabItem<T>[]
  activeId: T
  onSelect: (id: T) => void
  label: string
  activationMode?: ActivationMode
  panelFocusable?: boolean
  panelRef?: Ref<HTMLDivElement>
  disabled?: boolean
  className?: string
  listClassName?: string
  children: ReactNode
}

const TAB_CLASSES = {
  base: [TAB_LOOK.base, 'disabled:opacity-50', DISABLED_CURSOR],
  active: TAB_LOOK.active,
  idle: [TAB_LOOK.idle, 'can-hover:enabled:hover:text-primary'],
} as const

const LIST_BASE = 'flex'

function isBlank(text: string): boolean {
  return text.trim() === ''
}

function assertValidTabs<T extends string>(
  items: readonly TabItem<T>[],
  activeId: T,
  label: string
): void {
  if (items.length === 0) throw new Error(TABS_ERRORS.emptyItems)
  if (isBlank(label) || items.some((item) => isBlank(item.label))) {
    throw new Error(TABS_ERRORS.blankLabel)
  }
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error(TABS_ERRORS.duplicateId)
  }
  if (!items.some((item) => item.id === activeId)) throw new Error(TABS_ERRORS.unknownActiveId)
}

function indexForKey(current: number, last: number, key: string): number | null {
  switch (key) {
    case 'ArrowRight':
      return current === last ? 0 : current + 1
    case 'ArrowLeft':
      return current === 0 ? last : current - 1
    case 'Home':
      return 0
    case 'End':
      return last
    default:
      return null
  }
}

export function Tabs<T extends string>({
  items,
  activeId,
  onSelect,
  label,
  activationMode = 'automatic',
  panelFocusable = false,
  panelRef,
  disabled = false,
  className,
  listClassName,
  children,
}: TabsProps<T>): JSX.Element {
  assertValidTabs(items, activeId, label)
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const tabId = (id: T): string => `${baseId}-tab-${id}`
  const tabRefs = useRef(new Map<T, HTMLButtonElement>())

  function select(id: T): void {
    if (id !== activeId) onSelect(id)
  }

  function focusedIndex(target: EventTarget): number {
    const index = items.findIndex((item) => tabRefs.current.get(item.id) === target)
    return index === -1 ? items.findIndex((item) => item.id === activeId) : index
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (disabled) return
    const nextIndex = indexForKey(focusedIndex(event.target), items.length - 1, event.key)
    const next = nextIndex === null ? undefined : items[nextIndex]
    if (!next) return
    event.preventDefault()
    if (activationMode === 'automatic') select(next.id)
    tabRefs.current.get(next.id)?.focus()
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn(LIST_BASE, listClassName)}
      >
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              ref={(element) => {
                if (element) tabRefs.current.set(item.id, element)
                else tabRefs.current.delete(item.id)
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={disabled}
              onClick={() => select(item.id)}
              className={cn(TAB_CLASSES.base, isActive ? TAB_CLASSES.active : TAB_CLASSES.idle)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        ref={panelRef}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(activeId)}
        tabIndex={panelFocusable ? 0 : undefined}
        className={panelFocusable ? cn(FOCUS_RING, SCRIPT_FOCUS_RING) : undefined}
      >
        {children}
      </div>
    </div>
  )
}
