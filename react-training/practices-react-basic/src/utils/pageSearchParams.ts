export const PAGE_PARAM = 'page'

const FIRST_PAGE = 1

export function withPageParam(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > FIRST_PAGE) next.set(PAGE_PARAM, String(page))
  else next.delete(PAGE_PARAM)
  return next
}

export function pageHref(pathname: string, params: URLSearchParams, page: number): string {
  const search = withPageParam(params, page).toString()
  return search === '' ? pathname : `${pathname}?${search}`
}
