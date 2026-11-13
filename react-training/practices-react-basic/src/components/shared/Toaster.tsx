import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CloseButton } from '@/components/ui/CloseButton'
import { useTopLayerHost } from '@/components/ui/topLayer'
import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/utils/cn'
import type { FocusEvent, PointerEvent } from 'react'
import type { Toast, ToastPauseReason, ToastType } from '@/types'

const STACK_LABEL = 'Notifications'

const CLOSE_LABEL = 'Close notification'

const PAUSE_REASONS: ToastPauseReason[] = ['focus', 'hover']

const ANNOUNCE_DELAY_MS = 0

const hostKeys = new WeakMap<HTMLElement, number>()

let lastHostKey = 0

const STACK_CLASSES = [
  'pointer-events-none fixed inset-x-4 top-[calc(16px_+_env(safe-area-inset-top))] z-50 flex flex-col gap-2',
  'md:left-auto md:right-6 md:w-[360px]',
]

const TOAST_CLASSES =
  'pointer-events-auto flex items-start gap-3 border-l-4 bg-white p-4 shadow-header'

const TOAST_BORDER: Record<ToastType, string> = {
  success: 'border-primary',
  info: 'border-medium-dark',
  error: 'border-error',
}

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
  onPause: (id: string, reason: ToastPauseReason) => void
  onResume: (id: string, reason: ToastPauseReason) => void
}

interface AnnouncerProps {
  entries: Toast[]
}

interface Announcement extends Toast {
  hostKey: number
}

function isMouse(event: PointerEvent<HTMLElement>): boolean {
  return event.pointerType === 'mouse'
}

function focusLeaves(event: FocusEvent<HTMLElement>): boolean {
  const next = event.relatedTarget
  return !(next instanceof Node && event.currentTarget.contains(next))
}

function ToastItem({ toast, onClose, onPause, onResume }: ToastItemProps): JSX.Element {
  return (
    <div
      className={cn(TOAST_CLASSES, TOAST_BORDER[toast.type])}
      onFocus={() => onPause(toast.id, 'focus')}
      onBlur={(event) => {
        if (focusLeaves(event)) onResume(toast.id, 'focus')
      }}
      onPointerEnter={(event) => {
        if (isMouse(event)) onPause(toast.id, 'hover')
      }}
      onPointerLeave={(event) => {
        if (isMouse(event)) onResume(toast.id, 'hover')
      }}
    >
      <p className="flex-1 break-words font-heading text-lg font-normal leading-normal text-dark">
        {toast.message}
      </p>
      <CloseButton label={CLOSE_LABEL} onClick={() => onClose(toast.id)} />
    </div>
  )
}

function Announcer({ entries }: AnnouncerProps): JSX.Element {
  const statusEntries = entries.filter((entry) => entry.type !== 'error')
  const alertEntries = entries.filter((entry) => entry.type === 'error')
  return (
    <>
      <div role="status" className="sr-only">
        {statusEntries.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
      <div role="alert" className="sr-only">
        {alertEntries.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
    </>
  )
}

function useAnnouncements(toasts: Toast[], currentHostKey: number): Toast[] {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    const timer = setTimeout(() => {
      const liveIds = new Set(toasts.map((toast) => toast.id))
      const fresh = toasts.filter((toast) => !seenIds.current.has(toast.id))
      seenIds.current = new Set(
        [...seenIds.current, ...fresh.map((toast) => toast.id)].filter((id) => liveIds.has(id))
      )
      setAnnouncements((current) => [
        ...current.filter((entry) => liveIds.has(entry.id)),
        ...fresh.map((toast) => ({ ...toast, hostKey: currentHostKey })),
      ])
    }, ANNOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [toasts, currentHostKey])

  const liveIds = new Set(toasts.map((toast) => toast.id))
  return announcements.filter((entry) => entry.hostKey === currentHostKey && liveIds.has(entry.id))
}

function hostKey(host: HTMLElement): number {
  const known = hostKeys.get(host)
  if (known !== undefined) return known
  lastHostKey += 1
  hostKeys.set(host, lastHostKey)
  return lastHostKey
}

function useResumeOnHostChange(host: HTMLElement): void {
  const previousHost = useRef(host)

  useEffect(() => {
    if (previousHost.current === host) return
    previousHost.current = host
    const { toasts, resumeToast } = useToastStore.getState()
    toasts.forEach((toast) => PAUSE_REASONS.forEach((reason) => resumeToast(toast.id, reason)))
  }, [host])
}

export function Toaster(): JSX.Element {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)
  const pauseToast = useToastStore((state) => state.pauseToast)
  const resumeToast = useToastStore((state) => state.resumeToast)
  const host = useTopLayerHost() ?? document.body
  const currentHostKey = hostKey(host)
  const entries = useAnnouncements(toasts, currentHostKey)
  useResumeOnHostChange(host)

  return createPortal(
    <>
      <Announcer key={currentHostKey} entries={entries} />
      {toasts.length > 0 && (
        <section aria-label={STACK_LABEL} className={cn(STACK_CLASSES)}>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={removeToast}
              onPause={pauseToast}
              onResume={resumeToast}
            />
          ))}
        </section>
      )}
    </>,
    host
  )
}
