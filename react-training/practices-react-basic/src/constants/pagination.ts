export const PAGINATION_TEXT = {
  navLabel: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  pageOf: (page: number, totalPages: number): string => `Page ${page} of ${totalPages}`,
} as const
