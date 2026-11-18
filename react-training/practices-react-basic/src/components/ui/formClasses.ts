export const FORM_ERROR_TEXT = 'font-body text-sm leading-normal text-error'

export const FIELD_LABEL = 'font-body text-lg font-bold leading-normal text-dark'

export const FIELD_CONTROL =
  'h-12 w-full rounded-none border border-medium bg-white px-4 font-heading text-lg leading-normal text-dark disabled:opacity-50'

export const FIELD_INVALID = 'border-error'

export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ')
  return joined || undefined
}
