import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import type { FormEvent } from 'react'

const SEARCH_ICON = '/icons/search.svg'

interface HeaderSearchProps {
  className?: string
}

export function HeaderSearch({ className }: HeaderSearchProps): JSX.Element {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed === '') return
    navigate(ROUTES.SEARCH_RESULTS(trimmed))
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative w-[250px]', className)}>
      <label htmlFor={inputId} className="sr-only">
        {HEADER_TEXT.searchLabel}
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={HEADER_TEXT.searchPlaceholder}
        className={cn(
          'h-12 w-full rounded-10 border-[1.5px] border-medium bg-white pl-4 pr-10',
          'font-heading text-lg font-normal leading-normal text-dark placeholder:text-medium-dark',
          '[&::-webkit-search-cancel-button]:appearance-none',
          FOCUS_RING
        )}
      />
      <button
        type="submit"
        aria-label={HEADER_TEXT.searchSubmit}
        className={cn(
          'absolute left-[216px] top-[15px] inline-flex size-[18px] items-center justify-center',
          FOCUS_RING,
          HOVER_OPACITY
        )}
      >
        <img src={SEARCH_ICON} alt="" className="size-[18px]" />
      </button>
    </form>
  )
}
