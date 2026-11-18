export const SEARCH_ICON_SRC = '/icons/search.svg'

export const SUGGESTION_SKELETON_ROWS = 3

function resultCount(count: number): string {
  return count === 1 ? '1 suggestion' : `${count} suggestions`
}

export const SEARCH_TEXT = {
  listLabel: 'Search suggestions',
  category: 'Category',
  loadError: 'Could not load suggestions',
  noResults: 'No results',
  resultCount,
} as const
