import { skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import * as searchService from '@/services/searchService'
import { useDebounce } from './useDebounce'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedList, Product, Suggestion } from '@/types'

type SearchResultsKey = ReturnType<typeof queryKeys.search.results>

export const SEARCH_DEBOUNCE_MS = 300

function isSameSearch(previousKey: SearchResultsKey | undefined, search: string): boolean {
  return previousKey?.[2] === search
}

export function useSearchSuggestions(query: string): UseQueryResult<Suggestion[], Error> {
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  const search = searchService.normalizeQuery(debouncedQuery)

  return useQuery({
    queryKey: queryKeys.search.suggestions(search),
    queryFn: search ? () => searchService.searchSuggestions(search) : skipToken,
  })
}

export function useSearchResults(
  query: string,
  page: number
): UseQueryResult<PaginatedList<Product>, Error> {
  const search = searchService.normalizeQuery(query)

  return useQuery({
    queryKey: queryKeys.search.results(search, page),
    queryFn: search ? () => searchService.searchProducts(search, page) : skipToken,
    placeholderData: (previousData, previousQuery) =>
      isSameSearch(previousQuery?.queryKey, search) ? previousData : undefined,
  })
}
