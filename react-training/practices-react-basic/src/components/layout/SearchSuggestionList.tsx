import { PRICE_TEXT_CLASSES } from '@/components/shared/productCardClasses'
import { ImageThumbnail } from '@/components/shared/ProductThumbnail'
import { Skeleton } from '@/components/ui/Skeleton'
import { SEARCH_ICON_SRC, SEARCH_TEXT, SUGGESTION_SKELETON_ROWS } from '@/constants/search'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { suggestionKey } from '@/utils/suggestionRoute'
import type { Suggestion } from '@/types'

export type SuggestionListState =
  | { kind: 'results'; suggestions: Suggestion[] }
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'pending' }

interface SearchSuggestionListProps {
  state: SuggestionListState
  listboxId: string
  activeIndex: number
  rowClassName: string
  optionId: (suggestion: Suggestion) => string
  onSelect: (suggestion: Suggestion) => void
}

interface SkeletonRowsProps {
  rowClassName: string
}

interface SuggestionRowProps {
  suggestion: Suggestion
}

const ROW = 'flex items-center gap-3 py-2'

const ROW_NAME = 'min-w-0 flex-1 truncate font-heading text-lg font-normal leading-normal text-dark'

const MESSAGE = 'py-2 font-heading text-lg font-normal leading-normal text-dark'

function SuggestionRow({ suggestion }: SuggestionRowProps): JSX.Element {
  if (suggestion.type === 'category') {
    return (
      <>
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center">
          <img src={SEARCH_ICON_SRC} alt="" className="size-[18px]" />
        </span>
        <span className={ROW_NAME}>{suggestion.category.name}</span>
        <span className="shrink-0 font-heading text-sm leading-normal text-medium-dark">
          {SEARCH_TEXT.category}
        </span>
      </>
    )
  }
  return (
    <>
      <ImageThumbnail src={suggestion.product.thumbnail} className="size-10" />
      <span className={ROW_NAME}>{suggestion.product.name}</span>
      <span className={PRICE_TEXT_CLASSES}>
        {formatCurrency(suggestion.product.price, 'short')}
      </span>
    </>
  )
}

function SkeletonRows({ rowClassName }: SkeletonRowsProps): JSX.Element {
  return (
    <div aria-hidden="true">
      {Array.from({ length: SUGGESTION_SKELETON_ROWS }, (_, index) => (
        <div key={index} className={cn(ROW, rowClassName)}>
          <Skeleton className="size-10 shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}

export function SearchSuggestionList({
  state,
  listboxId,
  activeIndex,
  rowClassName,
  optionId,
  onSelect,
}: SearchSuggestionListProps): JSX.Element {
  if (state.kind === 'pending') return <SkeletonRows rowClassName={rowClassName} />
  if (state.kind === 'error')
    return <p className={cn(MESSAGE, rowClassName)}>{SEARCH_TEXT.loadError}</p>
  if (state.kind === 'empty')
    return <p className={cn(MESSAGE, rowClassName)}>{SEARCH_TEXT.noResults}</p>

  return (
    <ul id={listboxId} role="listbox" aria-label={SEARCH_TEXT.listLabel}>
      {state.suggestions.map((suggestion, index) => {
        const isActive = index === activeIndex
        return (
          <li
            key={suggestionKey(suggestion)}
            id={optionId(suggestion)}
            role="option"
            aria-selected={isActive}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(suggestion)}
            className={cn(
              ROW,
              rowClassName,
              'cursor-pointer can-hover:hover:bg-light',
              isActive && 'bg-light'
            )}
          >
            <SuggestionRow suggestion={suggestion} />
          </li>
        )
      })}
    </ul>
  )
}
