import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { SEARCH_ICON_SRC, SEARCH_TEXT } from '@/constants/search'
import { useSearchSuggestions } from '@/hooks/useSearch'
import { cn } from '@/utils/cn'
import { suggestionKey, suggestionRoute } from '@/utils/suggestionRoute'
import { SearchSuggestionList } from './SearchSuggestionList'
import type { SuggestionListState } from './SearchSuggestionList'
import type { FocusEvent, FormEvent, KeyboardEvent, ReactNode, RefObject } from 'react'
import type { Suggestion } from '@/types'

type SearchComboboxVariant = 'dropdown' | 'overlay'

interface SearchComboboxProps {
  variant: SearchComboboxVariant
  inputRef?: RefObject<HTMLInputElement>
  onNavigate?: () => void
  endSlot?: ReactNode
  className?: string
}

interface ActiveOption {
  list: Suggestion[]
  index: number
}

interface VariantClasses {
  root: string
  inputRow: string
  panel: string
  row: string
  dismissOnFocusLeave: boolean
}

const VARIANT_CLASSES: Record<SearchComboboxVariant, VariantClasses> = {
  dropdown: {
    root: 'relative w-[250px]',
    inputRow: '',
    panel: 'absolute right-0 top-full z-10 mt-2 w-full rounded-10 bg-white py-2 shadow-header',
    row: 'px-4',
    dismissOnFocusLeave: true,
  },
  overlay: {
    root: 'flex flex-col',
    inputRow: 'flex items-center gap-2 px-4 py-2 md:px-6',
    panel: 'py-2',
    row: 'px-4 md:px-6',
    dismissOnFocusLeave: false,
  },
}

function listState(data: Suggestion[] | undefined, error: Error | null): SuggestionListState {
  if (data !== undefined) {
    return data.length === 0 ? { kind: 'empty' } : { kind: 'results', suggestions: data }
  }
  if (error !== null) return { kind: 'error' }
  return { kind: 'pending' }
}

function statusText(state: SuggestionListState): string {
  if (state.kind === 'results') return SEARCH_TEXT.resultCount(state.suggestions.length)
  if (state.kind === 'empty') return SEARCH_TEXT.noResults
  if (state.kind === 'error') return SEARCH_TEXT.loadError
  return ''
}

function focusLeaves(event: FocusEvent<HTMLElement>): boolean {
  const next = event.relatedTarget
  return next instanceof Node && !event.currentTarget.contains(next)
}

function nextIndex(current: number, count: number, step: 1 | -1): number {
  if (current < 0) return step === 1 ? 0 : count - 1
  return (current + step + count) % count
}

export function SearchCombobox({
  variant,
  inputRef,
  onNavigate,
  endSlot,
  className,
}: SearchComboboxProps): JSX.Element {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isDismissed, setIsDismissed] = useState(false)
  const [active, setActive] = useState<ActiveOption | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const listboxId = useId()
  const { data, error } = useSearchSuggestions(query)
  const classes = VARIANT_CLASSES[variant]

  const isShown = query.trim() !== '' && !isDismissed
  const state = listState(data, error)
  const suggestions = state.kind === 'results' ? state.suggestions : []
  const activeIndex = active !== null && active.list === data ? active.index : -1
  const activeSuggestion = isShown ? suggestions[activeIndex] : undefined
  const isListboxMounted = isShown && state.kind === 'results'

  useEffect(() => {
    if (!isShown) return
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      setIsDismissed(true)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isShown])

  function optionId(suggestion: Suggestion): string {
    return `${listboxId}-${suggestionKey(suggestion)}`
  }

  function finishNavigation(to: string): void {
    setIsDismissed(true)
    navigate(to)
    onNavigate?.()
  }

  function handleQueryChange(value: string): void {
    setQuery(value)
    setIsDismissed(false)
  }

  function moveActive(step: 1 | -1): void {
    if (data === undefined || suggestions.length === 0) return
    setActive({ list: data, index: nextIndex(activeIndex, suggestions.length, step) })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isShown) {
        setIsDismissed(false)
        return
      }
      moveActive(event.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (event.key === 'Enter' && activeSuggestion !== undefined) {
      event.preventDefault()
      finishNavigation(suggestionRoute(activeSuggestion))
      return
    }
    if (event.key === 'Escape' && isShown) {
      event.preventDefault()
      event.stopPropagation()
      setIsDismissed(true)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed === '') return
    finishNavigation(ROUTES.SEARCH_RESULTS(trimmed))
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (classes.dismissOnFocusLeave && isShown && focusLeaves(event)) setIsDismissed(true)
  }

  return (
    <div ref={rootRef} onBlur={handleBlur} className={cn(classes.root, className)}>
      <div className={classes.inputRow}>
        <form role="search" onSubmit={handleSubmit} className="relative w-full">
          <label htmlFor={inputId} className="sr-only">
            {HEADER_TEXT.searchLabel}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            enterKeyHint="search"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isShown}
            aria-controls={isListboxMounted ? listboxId : undefined}
            aria-activedescendant={
              activeSuggestion !== undefined ? optionId(activeSuggestion) : undefined
            }
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={HEADER_TEXT.searchPlaceholder}
            className={cn(
              'h-12 w-full rounded-10 border-[1.5px] border-medium bg-white pl-4 pr-10',
              'font-heading text-lg font-normal leading-normal text-dark placeholder:text-medium-dark',
              FOCUS_RING
            )}
          />
          <button
            type="submit"
            aria-label={HEADER_TEXT.searchSubmit}
            className={cn(
              'absolute right-4 top-[15px] inline-flex size-[18px] items-center justify-center',
              FOCUS_RING,
              HOVER_OPACITY
            )}
          >
            <img src={SEARCH_ICON_SRC} alt="" className="size-[18px]" />
          </button>
        </form>
        {endSlot}
      </div>
      {isShown && (
        <div className={classes.panel}>
          <SearchSuggestionList
            state={state}
            listboxId={listboxId}
            activeIndex={activeIndex}
            rowClassName={classes.row}
            optionId={optionId}
            onSelect={(suggestion) => finishNavigation(suggestionRoute(suggestion))}
          />
        </div>
      )}
      <p role="status" className="sr-only">
        {isShown ? statusText(state) : ''}
      </p>
    </div>
  )
}
